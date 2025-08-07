package com.gpt.squirrelLogistics.service.driver;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.simulation.driver.DummyTracker;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RouteServiceImpl implements RouteService {
	
    private final KakaoRouteClient kakaoClient;
	private final DummyTracker dummyTracker;

	@Override
	public RouteInfoDTO getLiveRoute(String driverId) {

		 return dummyTracker.getCurrentRoute(driverId);
	}
	
	@Override
	public void startDummy(String driverId, LatLng start, LatLng end) {
	    dummyTracker.startTracking(driverId, start, end);
	}
}
