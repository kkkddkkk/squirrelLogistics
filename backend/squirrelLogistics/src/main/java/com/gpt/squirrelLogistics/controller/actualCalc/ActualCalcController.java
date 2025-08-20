package com.gpt.squirrelLogistics.controller.actualCalc;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.controller.companyHistory.CompanyHistoryController;
import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.actualCalc.EstimateCalcDTO;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/public/actualCalc")
public class ActualCalcController {
	
	private final DeliveryAssignmentService deliveryAssignmentService;
	private final DeliveryRequestService deliveryRequestService;

	@GetMapping
	@TimedEndpoint("getActualCalc")
	public ActualCalcDTO getActualCalc(@RequestParam("assignedId") Long assignedId){
		return deliveryAssignmentService.getActualCalc(assignedId);
	}
	
	@GetMapping("/thisEstimate")
	@TimedEndpoint("getActualCalc")
	public EstimateCalcDTO getEstimated(@RequestParam("requestId") Long requestId){
		//거리, 무게, 예상 금액, 경유지 갯수, 추가금 순서
		Object[] estimateCalcObject = deliveryRequestService.getEstimateCalc(requestId).get(0);
		
		EstimateCalcDTO estimateCalcDTO = EstimateCalcDTO.builder()
				.distance(((Number)estimateCalcObject[0]).longValue())
				.weight(((Number)estimateCalcObject[1]).longValue())
				.estimatedFee(((Number)estimateCalcObject[2]).longValue())
				.dropOrderNum(((Number)estimateCalcObject[3]).longValue())
				.cargoTypeFee(((Number)estimateCalcObject[4]).longValue())
				.handlingId(((Number)estimateCalcObject[5]).longValue())
				.build();
		
		return estimateCalcDTO;
	}
	
}
