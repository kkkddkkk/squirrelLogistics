package com.gpt.squirrelLogistics.external.api.kakao;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
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
	private static final String KAKAO_REST_API_KEY = "KakaoAK a9b27d11d11d4f05e7134f9de285845d";

	// 출잘지-도착지 버전.
	public RouteInfoDTO requestRoute(LatLng start, LatLng end) {

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
			throw new IllegalStateException("카카오 경로 응답 없음");
		}

		Long distance = (long) body.getRoutes().get(0).getSummary().getDistance();
		Long duration = (long) body.getRoutes().get(0).getSummary().getDuration();
		List<LatLng> polyline = extractPolyline(body);

		return RouteInfoDTO.builder().polyline(polyline).distance(distance).duration(duration).build();
	}

	// 경유지 포함 버전 (구간 합산).
	public RouteInfoDTO requestRoute(List<LatLng> waypoints) {
		if (waypoints == null || waypoints.size() < 2) {
			throw new IllegalArgumentException("경로 계산을 위해서는 최소 2개 이상의 좌표가 필요합니다.");
		}

		List<LatLng> pts = new ArrayList<>();
		long totalDist = 0;
		long totalDur = 0;

		// 연속된 두 지점씩 끊어서 경로를 요청
		for (int i = 0; i < waypoints.size() - 1; i++) {
			LatLng from = waypoints.get(i);
			LatLng to = waypoints.get(i + 1);

			RouteInfoDTO leg = requestRoute(from, to);
			if (leg != null) {
				pts.addAll(leg.getPolyline());
				totalDist += leg.getDistance();
				totalDur += leg.getDuration();
			}
		}

		return RouteInfoDTO.builder().polyline(pts).distance(totalDist).duration(totalDur).build();
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
		List<LatLng> pts = normalizeTrackPoints(rawPoints);

		if (pts.size() < 2)
			return new EncodedRouteSummary(0L, encodePolyline(pts));

		long havTotal = 0;
		long routedTotal = 0;
		List<LatLng> finalPolyline = new ArrayList<>();

		for (int i = 0; i < pts.size() - 1; i++) {
			LatLng a = pts.get(i), b = pts.get(i + 1);
			double gap = haversineMeters(a, b);

			// 1) 중복/스파이크 제거
			if (gap < 5)
				continue; // 같은 좌표
			if (gap > 2000) { // 2km 이상 튐
				routedTotal += Math.round(gap);
				continue;
			}

			// 2) 하버사인 기본
			long havGap = Math.round(gap);
			havTotal += havGap;

			// 3) 라우팅 (gap >= 1000m)
			if (gap >= 1000) {
				try {
					RouteInfoDTO leg = requestRoute(a, b);
					long d = leg.getDistance();
					long capped = Math.min(d, Math.round(gap * 1.5));
					routedTotal += capped;
					finalPolyline.addAll(leg.getPolyline());
				} catch (Exception e) {
					routedTotal += havGap;
				}
			} else {
				routedTotal += havGap;
				finalPolyline.add(a);
			}
		}

		// 4) 전역 보정
		long globalCap = Math.round(havTotal * 1.2); // 최대 20% 오차 허용
		long safeTotal = Math.min(routedTotal, globalCap);

		return new EncodedRouteSummary(safeTotal, encodePolyline(finalPolyline));
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
	private List<LatLng> normalizeTrackPoints(List<LatLng> raw) {
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
