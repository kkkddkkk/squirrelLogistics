package com.gpt.squirrelLogistics.controller.actualCalc;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.companyHistory.CompanyHistoryController;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/actualCalc")
public class ActualCalcController {
	
	private final DeliveryAssignmentService deliveryAssignmentService;
//
//	@GetMapping
//	@TimedEndpoint("getActualCalc")
//	public List<Object[]> getActualCalc(@RequestParam("assignedId") Long assignedId){
//		return deliveryAssignmentService.getTodayList(assignedId);
//	}
//	
}
