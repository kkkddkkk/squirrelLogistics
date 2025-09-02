package com.gpt.squirrelLogistics.external.api.kakao;


import java.math.BigDecimal;
import java.net.URI;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gpt.squirrelLogistics.common.LatLng;

import lombok.extern.log4j.Log4j2;

@Component
@Log4j2
public class KakaoLocalClient {
	
	//KakaoLocalClient: 카카오 로컬 API 호출 => LatLng 반환용(주소-좌표).
	//KakaoRouteClient: 카카오 내비 API 호출 => RouteInfoDTO 반환용(좌표-경로).
	private final RestTemplate restTemplate = new RestTemplate();

    private static final String LOCAL_API_URL = "https://dapi.kakao.com/v2/local/search/address.json";
    private static final String KAKAO_REST_API_KEY = "KakaoAK 866375a2baec52acc22ae2904599355c";


    @JsonIgnoreProperties(ignoreUnknown = true)
    static class KakaoLocalResp {
        public Doc[] documents;
        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Doc { public String x; public String y; }
    }

    public LatLng geocode(String address) {
        long t0 = System.nanoTime();

        if (address == null || address.isBlank()) {
            log.warn("[KAKAO-GEOCODE] blank address");
            return null;
        }
        final String query = address.trim();

        try {
            // ✅ 한글 쿼리 인코딩: build().encode(UTF-8).toUri()
            URI uri = UriComponentsBuilder.fromHttpUrl(LOCAL_API_URL)
                    .queryParam("query", query)
                    .build()
                    .encode(StandardCharsets.UTF_8)
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", KAKAO_REST_API_KEY.trim()); // "KakaoAK " + {키}
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<KakaoLocalResp> resp =
                    restTemplate.exchange(uri, HttpMethod.GET, entity, KakaoLocalResp.class);

            if (resp == null || !resp.getStatusCode().is2xxSuccessful()) {
                log.error("[KAKAO-GEOCODE] non-2xx status={} addr='{}'",
                        (resp == null ? "null" : resp.getStatusCode()), query);
                return null;
            }

            KakaoLocalResp body = resp.getBody();
            if (body == null || body.documents == null || body.documents.length == 0) {
                log.info("[KAKAO-GEOCODE] no results (0 docs) addr='{}'", query);
                return null;
            }

            var doc = body.documents[0];
            if (doc.x == null || doc.y == null) {
                log.warn("[KAKAO-GEOCODE] first doc missing x/y addr='{}'", query);
                return null;
            }

            BigDecimal lng = BigDecimal.valueOf(Double.parseDouble(doc.x));
            BigDecimal lat = BigDecimal.valueOf(Double.parseDouble(doc.y));
            log.info("[KAKAO-GEOCODE] OK ({}, {}) addr='{}' took={}ms",
                    lat, lng, query, Math.round((System.nanoTime()-t0)/1_000_000.0));
            return new LatLng(lat, lng);

        } catch (Exception e) {
            log.error("[KAKAO-GEOCODE] unexpected error addr='{}'", query, e);
            return null;
        }
    }

    private static long elapsedMs(long t0) {
        return Math.round((System.nanoTime() - t0) / 1_000_000.0);
    }

    private static String safe(String s) {
        return s == null ? "null" : s;
    }
}
