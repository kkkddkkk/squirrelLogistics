package com.gpt.squirrelLogistics.service.driver;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.driver.RouteInfoDTO;

public interface RouteService {
	public RouteInfoDTO getLiveRoute(String driverId);
	public void startDummy(String driverId, LatLng start, LatLng end);
}
