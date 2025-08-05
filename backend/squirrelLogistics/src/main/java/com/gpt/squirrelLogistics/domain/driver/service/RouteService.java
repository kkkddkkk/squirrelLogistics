package com.gpt.squirrelLogistics.domain.driver.service;

import com.gpt.squirrelLogistics.common.model.LatLng;
import com.gpt.squirrelLogistics.domain.driver.dto.RouteInfoDTO;

public interface RouteService {
	public RouteInfoDTO getLiveRoute(String driverId);
	public void startDummy(String driverId, LatLng start, LatLng end);
}
