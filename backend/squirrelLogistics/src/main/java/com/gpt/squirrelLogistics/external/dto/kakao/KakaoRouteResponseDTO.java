package com.gpt.squirrelLogistics.external.dto.kakao;

import java.util.List;

import lombok.Data;

@Data
public class KakaoRouteResponseDTO {
	
	  private List<Route> routes;

	    @Data
	    public static class Route {
	        private Summary summary;
	        private List<Section> sections;
	    }

	    @Data
	    public static class Summary {
	        private int distance;
	        private int duration;
	    }

	    @Data
	    public static class Section {
	        private List<Road> roads;
	    }

	    @Data
	    public static class Road {
	        private List<Double> vertexes;
	    }
}
