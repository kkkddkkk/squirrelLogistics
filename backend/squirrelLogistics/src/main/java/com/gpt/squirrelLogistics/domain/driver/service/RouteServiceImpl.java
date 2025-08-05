package com.gpt.squirrelLogistics.domain.driver.service;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.common.model.LatLng;
import com.gpt.squirrelLogistics.domain.driver.api.KakaoClient;
import com.gpt.squirrelLogistics.domain.driver.dto.RouteInfoDTO;
import com.gpt.squirrelLogistics.domain.route.simulation.DummyTracker;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class RouteServiceImpl implements RouteService {
	
    private final KakaoClient kakaoClient;
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
