package com.gpt.squirrelLogistics.dto.driver;

import java.util.List;

import com.gpt.squirrelLogistics.common.LatLng;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RouteInfoDTO {
	 private List<LatLng> polyline;      // 전체 경로
	    private int distance;               // 선택
	    private int duration;               // 선택
	    
	    private List<LatLng> visited;
	    private List<LatLng> expected;
	    private LatLng currentPosition;     // 현재 위치
}
