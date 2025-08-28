package com.gpt.squirrelLogistics.controller.actualCalc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.controller.companyHistory.CompanyHistoryController;
import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.actualCalc.EstimateCalcDTO;
import com.gpt.squirrelLogistics.monitoring.TimedEndpoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.deliveryWaypoint.DeliveryWaypointService;
import com.gpt.squirrelLogistics.service.user.AuthService;
import com.gpt.squirrelLogistics.service.user.KakaoOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/actualCalc")
public class ActualCalcController {

	private final KakaoOAuthService kakaoOAuthService;

	private final DeliveryAssignmentService deliveryAssignmentService;
	private final DeliveryRequestService deliveryRequestService;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final AuthService authService;
	private final JwtTokenProvider jwtTokenProvider;

	@GetMapping
	@TimedEndpoint("getActualCalc")
	public ActualCalcDTO getActualCalc(@RequestParam("assignedId") Long assignedId,
			@RequestHeader("Authorization") String authoHeader) {
		String token = authoHeader.replace("Bearer ", "");
		String memId = jwtTokenProvider.getUsername(token);
		return deliveryAssignmentService.getActualCalc(assignedId);
	}

	@GetMapping("/thisEstimate")
	@TimedEndpoint("getActualCalc")
	public EstimateCalcDTO getEstimated(@RequestParam("requestId") Long requestId) {
		// 거리, 무게, 예상 금액, 경유지 갯수, 추가금 순서
		List<Object[]> estimateCalcList = deliveryRequestService.getEstimateCalc(requestId);

		List<Object> handlingIds = estimateCalcList.stream()
			    .map(arr -> arr[arr.length - 1])
			    .collect(Collectors.toList());
		
		Optional<Integer> maxHandlingId = estimateCalcList.stream()
		        .map(arr -> ((Number) arr[arr.length - 1]).intValue()) // Object → int 변환
		        .max(Integer::compareTo);

		//cargoTypeFee 계산
		long cargoTypeFee = 0;
		long handlingId = 0;
		if (!maxHandlingId.isPresent()) {
			cargoTypeFee = 0;
		}else if((maxHandlingId.get() == 3) || (maxHandlingId.get() == 2 && handlingIds.contains(1))) {
			cargoTypeFee = 100000;
			handlingId = 3;
		}else if((maxHandlingId.get() == 2) || (maxHandlingId.get() == 1)) {
			cargoTypeFee = 50000;	
			if(maxHandlingId.get() == 2) handlingId = 2;
			else handlingId = 1;
		}

		Object[] estimateCalcObject = estimateCalcList.get(0);

		//경유지 list
		List<String> waypointList = deliveryWaypointRepository.findWaypointsByRequestId(requestId);

		EstimateCalcDTO estimateCalcDTO = EstimateCalcDTO.builder()
				.distance(((Number) estimateCalcObject[0]).longValue())
				.weight(((Number) estimateCalcObject[1]).longValue())
				.estimatedFee(((Number) estimateCalcObject[2]).longValue())
				.dropOrderNum((long)(waypointList.size()-2))
				.cargoTypeFee(cargoTypeFee)
				.handlingId(handlingId).build();

		return estimateCalcDTO;
	}

}
