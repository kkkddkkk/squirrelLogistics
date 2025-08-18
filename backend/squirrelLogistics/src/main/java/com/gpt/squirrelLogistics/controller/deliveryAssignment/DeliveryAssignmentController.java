package com.gpt.squirrelLogistics.controller.deliveryAssignment;



import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/delivery/assignments")
@RequiredArgsConstructor
@Log4j2
public class DeliveryAssignmentController {

	private final DeliveryRequestService requestService;
	private final DeliveryAssignmentService assignmentService;

	@GetMapping("/today")
	public ResponseEntity<DeliveryAssignmentSlimResponseDTO> getTodayAssignment(
			@RequestParam("driverId") Long driverId) {
		DeliveryAssignmentSlimResponseDTO result = assignmentService.getTodayAssignments(driverId);

		return ResponseEntity.ok(result);
	}

}
