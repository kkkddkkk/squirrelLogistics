package com.gpt.squirrelLogistics.domain.driver.api;


import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.gpt.squirrelLogistics.common.model.LatLng;
import com.gpt.squirrelLogistics.domain.driver.api.dto.KakaoRouteResponse;
import com.gpt.squirrelLogistics.domain.driver.dto.RouteInfoDTO;

@Component
public class KakaoClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String NAVI_API_URL = "https://apis-navi.kakaomobility.com/v1/directions";
    private static final String KAKAO_REST_API_KEY = "KakaoAK a9b27d11d11d4f05e7134f9de285845d"; // 실제 키로 교체

    public RouteInfoDTO requestRoute(LatLng start, LatLng end) {
        // 1. 쿼리 파라미터 설정 (경도,위도 순서)
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(NAVI_API_URL)
            .queryParam("origin", start.getLng() + "," + start.getLat())
            .queryParam("destination", end.getLng() + "," + end.getLat());

        // 2. 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", KAKAO_REST_API_KEY);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            // 3. GET 요청 보내기
            ResponseEntity<KakaoRouteResponse> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                KakaoRouteResponse.class
            );

            // 4. 응답에서 vertexes 가공
            List<LatLng> polyline = extractPolyline(response.getBody());

            return RouteInfoDTO.builder()
                .polyline(polyline)
                .distance(response.getBody().getRoutes().get(0).getSummary().getDistance())
                .duration(response.getBody().getRoutes().get(0).getSummary().getDuration())
                .build();

        } catch (Exception e) {
            throw new RuntimeException("카카오 경로 요청 실패", e);
        }
    }

    private List<LatLng> extractPolyline(KakaoRouteResponse response) {
        List<LatLng> polyline = new ArrayList<>();

        List<Double> vertexes = response.getRoutes()
            .get(0)
            .getSections()
            .get(0)
            .getRoads()
            .stream()
            .flatMap(r -> r.getVertexes().stream())
            .toList();

        // vertexes = [경, 위, 경, 위, ...]
        for (int i = 0; i < vertexes.size(); i += 2) {
            double lng = vertexes.get(i);
            double lat = vertexes.get(i + 1);
            polyline.add(new LatLng(lat, lng));
        }

        return polyline;
    }
    
    
    public int calculateTotalDistance(LatLng start, LatLng end) {
        return requestRoute(start, end).getDistance();
    }

    public int estimateDuration(LatLng start, LatLng end) {
        return requestRoute(start, end).getDuration();
    }
}
