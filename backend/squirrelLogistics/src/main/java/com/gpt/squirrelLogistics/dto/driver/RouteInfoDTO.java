package com.gpt.squirrelLogistics.dto.driver;

import java.util.List;

import com.gpt.squirrelLogistics.common.LatLng;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RouteInfoDTO {
	 private List<LatLng> polyline;      // 전체 경로
	    private Long distance;               // 선택
	    private Long duration;               // 선택
	    
	    private List<LatLng> visited;
	    private List<LatLng> expected;
	    private LatLng currentPosition;     // 현재 위치
	    
	    private Boolean outOfWay;          // 300m 이상 이탈 여부
	    private Double  deviationMeters;  // 예상 경로와의 최단 거리(m)
}
