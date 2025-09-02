package com.gpt.squirrelLogistics.common;

import java.util.List;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

public class RouteJson {
	 private RouteJson() {}

	    private static final ObjectMapper M = new ObjectMapper()
	            .findAndRegisterModules()
	            .configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, true);

	    public static List<LatLng> parseOrEmpty(String json) {
	        try {
	            if (json == null || json.isBlank()) return List.of();
	            return M.readValue(json, new TypeReference<List<LatLng>>() {});
	        } catch (Exception e) {
	            // 로깅만 하고 빈 리스트로
	            return List.of();
	        }
	    }

	    public static String toJson(List<LatLng> list) {
	        try {
	            return M.writeValueAsString(list == null ? List.of() : list);
	        } catch (Exception e) {
	            throw new IllegalArgumentException("경로 직렬화 실패", e);
	        }
	    }
}
