package com.gpt.squirrelLogistics.domain.driver.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.common.model.LatLng;
import com.gpt.squirrelLogistics.domain.driver.dto.RouteInfoDTO;
import com.gpt.squirrelLogistics.domain.driver.service.RouteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/route")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    
    @GetMapping("/start")
    public ResponseEntity<String> startDummyTracking(
        @RequestParam("driverId") String driverId,
        @RequestParam("startLat") double startLat,
        @RequestParam("startLng") double startLng,
        @RequestParam("endLat") double endLat,
        @RequestParam("endLng") double endLng) {

        routeService.startDummy(driverId,
            new LatLng(startLat, startLng),
            new LatLng(endLat, endLng));

        return ResponseEntity.ok("Dummy started for driverId=" + driverId);
    }
    
    @GetMapping("/live")
	  public ResponseEntity<RouteInfoDTO> getRoute(@RequestParam("driverId") String driverId) {
	        return ResponseEntity.ok(routeService.getLiveRoute(driverId));
	    }
	  	
}
