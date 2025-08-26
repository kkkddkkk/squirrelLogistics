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

	//작성자: 고은설.
	//기능: 실제 이동 좌표를 
	public EncodedRouteSummary summarizeRecordedPath(List<LatLng> points) {
		if (points == null || points.size() < 2) {
			return new EncodedRouteSummary(0L, encodePolyline(points == null ? List.of() : points));
		}
		long total = 0L;
		for (int i = 0; i < points.size() - 1; i++) {
			total += haversineMeters(points.get(i), points.get(i + 1));
		}
		String encoded = encodePolyline(points);
		return new EncodedRouteSummary(total, encoded);
	}

	// 작성자: 고은설.
	// 기능: 좌표 기반 이동 거리 측정.
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
}
