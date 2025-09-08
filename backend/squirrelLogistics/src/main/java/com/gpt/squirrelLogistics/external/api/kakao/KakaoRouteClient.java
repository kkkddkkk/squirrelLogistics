package com.gpt.squirrelLogistics.external.api.kakao;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gpt.squirrelLogistics.common.EncodedRouteSummary;
import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.dto.kakao.KakaoRouteResponseDTO;

import lombok.extern.log4j.Log4j2;

@Log4j2
@Component
public class KakaoRouteClient {

	// KakaoLocalClient: 카카오 로컬 API 호출 => LatLng 반환용(주소-좌표).
	// KakaoRouteClient: 카카오 내비 API 호출 => RouteInfoDTO 반환용(좌표-경로).

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	private static final String NAVI_API_URL = "https://apis-navi.kakaomobility.com/v1/directions";
	private static final String KAKAO_REST_API_KEY = "KakaoAK 866375a2baec52acc22ae2904599355c";

	public static class RouteResult {
		private final List<LatLng> polyline;
		private final Long distanceMeters; // nullable
		private final Long durationSec; // nullable
		private final String source; // "kakao" or "fallback"

		public RouteResult(List<LatLng> polyline, Long distanceMeters, Long durationSec, String source) {
			this.polyline = (polyline != null ? polyline : List.of());
			this.distanceMeters = distanceMeters;
			this.durationSec = durationSec;
			this.source = (source != null ? source : "kakao");
		}

		public List<LatLng> getPolyline() {
			return polyline;
		}

		public Long getDistanceMeters() {
			return distanceMeters;
		}

		public Long getDurationSec() {
			return durationSec;
		}

		public String getSource() {
			return source;
		}
	}

	// 출잘지-도착지 버전.
	public RouteInfoDTO requestRoute(LatLng start, LatLng end) {
		RouteResult rr = requestRouteSafe(start, end);
		return RouteInfoDTO.builder().polyline(rr.getPolyline())
				.distance(rr.getDistanceMeters() != null ? rr.getDistanceMeters()
						: Math.round(haversineSum(rr.getPolyline())))
				.duration(rr.getDurationSec() != null ? rr.getDurationSec()
						: estimateDurationSec(rr.getDistanceMeters() != null ? rr.getDistanceMeters()
								: Math.round(haversineSum(rr.getPolyline()))))
				.build();
	}

	// 경유지 포함 버전 (구간 합산).
	public RouteInfoDTO requestRoute(List<LatLng> waypoints) {
		if (waypoints == null || waypoints.size() < 2) {
			throw new IllegalArgumentException("경로 계산을 위해서는 최소 2개 이상의 좌표가 필요합니다.");
		}
		List<LatLng> pts = new ArrayList<>();
		long totalDist = 0;
		long totalDur = 0;

		for (int i = 0; i < waypoints.size() - 1; i++) {
			LatLng from = waypoints.get(i);
			LatLng to = waypoints.get(i + 1);

			RouteResult leg = requestRouteSafe(from, to);
			pts.addAll(leg.getPolyline());
			long d = (leg.getDistanceMeters() != null ? leg.getDistanceMeters()
					: Math.round(haversineSum(leg.getPolyline())));
			long s = (leg.getDurationSec() != null ? leg.getDurationSec() : estimateDurationSec(d));
			totalDist += d;
			totalDur += s;
		}

		return RouteInfoDTO.builder().polyline(pts).distance(totalDist).duration(totalDur).build();
	}

	public RouteResult requestRouteSafe(LatLng start, LatLng end) {
		try {
			String url = UriComponentsBuilder.fromHttpUrl(NAVI_API_URL)
					.queryParam("origin", start.getLng() + "," + start.getLat())
					.queryParam("destination", end.getLng() + "," + end.getLat()).toUriString();

			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", KAKAO_REST_API_KEY);
			HttpEntity<Void> entity = new HttpEntity<>(headers);

			ResponseEntity<KakaoRouteResponseDTO> response = restTemplate.exchange(url, HttpMethod.GET, entity,
					KakaoRouteResponseDTO.class);

			KakaoRouteResponseDTO body = response.getBody();
			if (body == null || body.getRoutes() == null || body.getRoutes().isEmpty()) {
				log.warn("[KAKAO] empty routes. fallback");
				return fallback(start, end, "empty-routes");
			}

			var r0 = body.getRoutes().get(0);
			// summary가 null일 수 있음 → NPE 방지
			Long dist = (r0.getSummary() != null ? (long) r0.getSummary().getDistance() : null);
			Long dura = (r0.getSummary() != null ? (long) r0.getSummary().getDuration() : null);

			List<LatLng> polyline = extractPolyline(body);
			if (polyline == null || polyline.isEmpty()) {
				log.warn("[KAKAO] empty polyline. fallback");
				return fallback(start, end, "empty-polyline");
			}
			return new RouteResult(polyline, dist, dura, "kakao");

		} catch (HttpClientErrorException e) {
			// -10 (limit exceeded) 포함 4xx
			log.warn("[KAKAO] http error {} body={}", e.getStatusCode(), e.getResponseBodyAsString());
			return fallback(start, end, "http-" + e.getStatusCode());
		} catch (Exception e) {
			log.warn("[KAKAO] exception: {}", e.toString());
			return fallback(start, end, "exception");
		}
	}

	private RouteResult fallback(LatLng start, LatLng end, String reason) {
		List<LatLng> line = straightLine(start, end);
		long dist = Math.round(haversineSum(line));
		long sec = estimateDurationSec(dist);
		log.warn("[KAKAO-FALLBACK] reason={}, dist={}m, dur={}s", reason, dist, sec);
		return new RouteResult(line, dist, sec, "fallback");
	}

	public String toJsonRoute(List<LatLng> points) {
		try {
			return objectMapper.writeValueAsString(points);
		} catch (JsonProcessingException e) {
			throw new RuntimeException("route(polyline points) 직렬화 실패", e);
		}
	}

	public String encodePolyline(List<LatLng> points) {
		StringBuilder out = new StringBuilder();
		long lastLat = 0, lastLng = 0;

		for (LatLng p : points) {
			// BigDecimal → double 변환 후 1e5 배율 적용
			long lat = Math.round(p.getLat().doubleValue() * 1e5);
			long lng = Math.round(p.getLng().doubleValue() * 1e5);

			long dLat = lat - lastLat;
			long dLng = lng - lastLng;

			encodeSigned(dLat, out);
			encodeSigned(dLng, out);

			lastLat = lat;
			lastLng = lng;
		}
		return out.toString();
	}

	private void encodeSigned(long v, StringBuilder out) {
		long s = v << 1;
		if (v < 0)
			s = ~s;
		while (s >= 0x20) {
			out.append((char) ((0x20 | (s & 0x1F)) + 63));
			s >>= 5;
		}
		out.append((char) (s + 63));
	}

	private List<LatLng> extractPolyline(KakaoRouteResponseDTO response) {

		List<LatLng> out = new ArrayList<>();
		var route0 = response.getRoutes().get(0);

		route0.getSections().forEach(sec -> {
			sec.getRoads().forEach(road -> {
				var v = road.getVertexes();
				for (int i = 0; i + 1 < v.size(); i += 2) {
					BigDecimal lng = v.get(i);
					BigDecimal lat = v.get(i + 1);
					out.add(new LatLng(lat, lng));
				}
			});
		});
		return out;
	}

	public Long calculateTotalDistance(LatLng start, LatLng end) {
		return requestRoute(start, end).getDistance();
	}

	public Long estimateDuration(LatLng start, LatLng end) {
		return requestRoute(start, end).getDuration();
	}

	// 작성자: 고은설.
	// 기능: 실제 이동 좌표를 경로 정보로 환산하여 이동 거리 및 폴리라인 제작.
	public EncodedRouteSummary summarizeRecordedPath(List<LatLng> rawPoints) {
		
		//중복 좌표 제거
	    List<LatLng> pts = normalizeTrackPoints(rawPoints);
	    if (pts.size() < 2) {
	        return new EncodedRouteSummary(0L, encodePolyline(pts));
	    }

	    //필요시 조정해주시면 됩니다~!(고은설).
	    final double DUP_EPS_M       = 5.0; //사실상 동일점 기준값.
	    final double TELEPORT_M      = 1500.0; //GPS 튐(거의 텔레포트) 기준값.
	    final double TELEPORT_CAP_M  = 200.0; //튐 구간 거리 상한.
	    final double ROUTE_MIN_M     = 3000.0; //이 이상일 때 라우팅.
	    final double ROUTE_CAP_X     = 1.5; //라우팅 결과 과대치 보정.

	    long total = 0L;
	    List<LatLng> outLine = new ArrayList<>();
	    outLine.add(pts.get(0));

	    for (int i = 0; i < pts.size() - 1; i++) {
	        LatLng a = pts.get(i);
	        LatLng b = pts.get(i + 1);

	        double gap = haversineMeters(a, b);
	        if (gap < DUP_EPS_M) {
	            //거의 같은 위치면 => 스킵.
	            continue;
	        }

	        if (gap >= TELEPORT_M) {
	            //1.5키로 텔레포트급 좌표 차이 => 직선거리 사용.
	            total += Math.round(TELEPORT_CAP_M);
	            outLine.add(b);
	            continue;
	        }

	        //3키로 이상 차이 => 여기부터 도로망 라우팅 사용.
	        if (gap >= ROUTE_MIN_M) {
	            try {
	                RouteInfoDTO leg = requestRoute(a, b);  //카카오 호출.
	                long d = (leg.getDistance() != null ? leg.getDistance() : Math.round(gap));
	                long capped = Math.min(d, Math.round(gap * ROUTE_CAP_X));
	                total += capped;

	                List<LatLng> geom = leg.getPolyline();
	                if (geom != null && !geom.isEmpty()) {
	                    // 이전 마지막점과 중복 첫점 제거.
	                    if (!outLine.isEmpty() && outLine.get(outLine.size()-1).equals(geom.get(0))) {
	                        geom = geom.subList(1, geom.size());
	                    }
	                    outLine.addAll(geom);
	                } else {
	                    //이어붙이기만.
	                    outLine.add(b);
	                }
	            } catch (Exception e) {
	                //라우팅 실패 =>  하버사인.
	                total += Math.round(gap);
	                outLine.add(b);
	            }
	        } else {
	            //짧은 구간 => 하버사인.
	            total += Math.round(gap);
	            outLine.add(b);
	        }
	    }

	    String encoded = encodePolyline(outLine);
	    return new EncodedRouteSummary(total, encoded);
	}

	private List<LatLng> straightLine(LatLng from, LatLng to) {
		int N = 32;
		var out = new ArrayList<LatLng>(N + 1);
		for (int i = 0; i <= N; i++) {
			double t = i / (double) N;
			var lat = from.getLat().multiply(BigDecimal.valueOf(1 - t))
					.add(to.getLat().multiply(BigDecimal.valueOf(t)));
			var lng = from.getLng().multiply(BigDecimal.valueOf(1 - t))
					.add(to.getLng().multiply(BigDecimal.valueOf(t)));
			out.add(new LatLng(lat, lng));
		}
		return out;
	}

	// 작성자: 고은설.
	// 기능: 좌표 기반 단순 직선 거리 합 측정.
	private long haversineMeters(LatLng a, LatLng b) {
		final double R = 6371000.0; // meters
		double rad = Math.PI / 180.0;

		// BigDecimal → double 변환
		double latA = a.getLat().doubleValue();
		double lngA = a.getLng().doubleValue();
		double latB = b.getLat().doubleValue();
		double lngB = b.getLng().doubleValue();

		double dLat = (latB - latA) * rad;
		double dLng = (lngB - lngA) * rad;

		double s1 = Math.sin(dLat / 2);
		double s2 = Math.sin(dLng / 2);

		double h = s1 * s1 + Math.cos(latA * rad) * Math.cos(latB * rad) * s2 * s2;
		double c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
		return Math.round(R * c);
	}

	// 작성자: 고은설.
	// 기능: 초인근 좌표 제외 유의미한 이동좌표만을 추려 새 안전 위치 배열 제작.
	public List<LatLng> normalizeTrackPoints(List<LatLng> raw) {
		if (raw == null || raw.isEmpty())
			return List.of();

		final double EPS = 1e-6; // ~10cm 단위
		List<LatLng> out = new ArrayList<>(raw.size());
		LatLng prev = null;
		for (LatLng p : raw) {
			if (p == null || p.getLat() == null || p.getLng() == null)
				continue;
			if (prev == null || !almostSame(prev, p, EPS)) {
				out.add(p);
				prev = p;
			}
		}
		return out;
	}

	private double haversineSum(List<LatLng> line) {
		double sum = 0;
		for (int i = 0; i + 1 < line.size(); i++) {
			sum += haversineMeters(line.get(i), line.get(i + 1));
		}
		return sum;
	}

	private static long estimateDurationSec(long distanceMeters) {
		double avgKmh = 35.0; 
		return Math.max(60, Math.round(distanceMeters / 1000.0 / avgKmh * 3600));
	}

	// 작성자: 고은설.
	// 기능: 지리적 같은 지점인지 아닌지 리턴.
	private boolean almostSame(LatLng a, LatLng b, double eps) {
		double dLat = Math.abs(a.getLat().doubleValue() - b.getLat().doubleValue());
		double dLng = Math.abs(a.getLng().doubleValue() - b.getLng().doubleValue());
		return dLat < eps && dLng < eps;
	}

	public List<LatLng> decimateByDistance(List<LatLng> points, double thresholdMeters) {
		List<LatLng> result = new ArrayList<>();
		if (points == null || points.isEmpty()) {
			return result;
		}

		// 첫 점은 무조건 유지
		result.add(points.get(0));
		LatLng lastKept = points.get(0);

		for (int i = 1; i < points.size(); i++) {
			LatLng curr = points.get(i);
			double dist = haversineMeters(lastKept, curr);

			if (dist >= thresholdMeters) {
				result.add(curr);
				lastKept = curr;
			}
		}

		// 마지막 점 보장 (경계 오차 방지)
		if (!result.get(result.size() - 1).equals(points.get(points.size() - 1))) {
			result.add(points.get(points.size() - 1));
		}

		return result;
	}
}
