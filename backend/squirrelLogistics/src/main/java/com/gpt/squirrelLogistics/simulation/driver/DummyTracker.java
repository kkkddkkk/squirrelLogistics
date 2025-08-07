package com.gpt.squirrelLogistics.simulation.driver;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DummyTracker {

	 private final KakaoRouteClient kakaoClient;
	 private final Map<String, DummyDriver> driverMap = new ConcurrentHashMap<>();

	    public void startTracking(String driverId, LatLng start, LatLng end) {
	        List<LatLng> route = kakaoClient.requestRoute(start, end).getPolyline();

	        DummyDriver dummy = new DummyDriver(driverId, route, kakaoClient);
	        dummy.start(); // 내부에서 Thread 시작
	        driverMap.put(driverId, dummy);
	    }

	    public RouteInfoDTO getCurrentRoute(String driverId) {
	        DummyDriver dummy = driverMap.get(driverId);
	        if (dummy == null) {
	            System.out.println("[DummyTracker] 더미 드라이버가 아직 등록되지 않았습니다: " + driverId);
	            throw new IllegalArgumentException("등록되지 않은 driverId입니다: " + driverId);
	        }
	        
	        return dummy.toRouteInfoDTO(); // 현재 위치 + 전체 경로 반환
	    }
}
