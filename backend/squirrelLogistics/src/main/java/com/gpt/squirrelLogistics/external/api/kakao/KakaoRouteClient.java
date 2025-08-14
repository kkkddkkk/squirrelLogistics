package com.gpt.squirrelLogistics.external.api.kakao;

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
	public RouteInfoDTO requestRoute(LatLng start, LatLng end, List<LatLng> waypoints) {
		List<LatLng> pts = new ArrayList<>();
		long totalDist = 0;
		long totalDur = 0;
		LatLng cur = start;
		if (waypoints != null) {
			for (LatLng wp : waypoints) {
				RouteInfoDTO leg = requestRoute(cur, wp);
				pts.addAll(leg.getPolyline());
				totalDist += leg.getDistance();
				totalDur += leg.getDuration();
				cur = wp;
			}
		}
		RouteInfoDTO last = requestRoute(cur, end);
		pts.addAll(last.getPolyline());
		totalDist += last.getDistance();
		totalDur += last.getDuration();

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
			long lat = Math.round(p.getLat() * 1e5);
			long lng = Math.round(p.getLng() * 1e5);
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
					double lng = v.get(i);
					double lat = v.get(i + 1);
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
}
