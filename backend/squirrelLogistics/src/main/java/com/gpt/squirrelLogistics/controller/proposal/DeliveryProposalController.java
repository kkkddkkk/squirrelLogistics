package com.gpt.squirrelLogistics.controller.proposal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/delivery/proposals")
@RequiredArgsConstructor
@Log4j2
public class DeliveryProposalController {

	private final DeliveryAssignmentService assignmentService;

	// 나에게 온 지명 제안 목록 (driverId 필수 쿼리파라미터).
	@GetMapping(params = "driverId")
	public ResponseEntity<List<DeliveryAssignmentProposalListDTO>> getMyProposals(
			@RequestParam("driverId") Long driverId) {
		var result = assignmentService.getProposals(driverId);
		return ResponseEntity.ok(result);
	}

	// 기존 공개요청 → 특정 기사에게 지명 제안 생성 (회사 전용).
	@PutMapping("/requests/{requestId:\\d+}/propose")
	public ResponseEntity<Map<String, Object>> proposeToDriver(@PathVariable Long requestId,
			@RequestParam Long driverId,
			@RequestParam(value = "expireAt", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expireAt) {

		if (expireAt == null)
			expireAt = LocalDateTime.now().plusDays(3);

		var result = assignmentService.propose(requestId, driverId);

		if (result.containsKey("FAILED")) {
			String code = String.valueOf(result.get("FAILED"));
			HttpStatus s = switch (code) {
			case "REQUEST_NOT_FOUND", "DRIVER_NOT_FOUND" -> HttpStatus.NOT_FOUND;
			case "ALREADY_ASSIGNED", "ALREADY_PROPOSED_TO_DRIVER" -> HttpStatus.CONFLICT;
			default -> HttpStatus.BAD_REQUEST;
			};
			return ResponseEntity.status(s).body(result);
		}

		return ResponseEntity
				.ok(Map.of("SUCCESS", "PROPOSED", "assignmentId", result.get("assignmentId"), "expireAt", expireAt));
	}

	// 지명 제안 ‘수락’ (기사 전용).
	@PutMapping("/{requestId:\\d+}/accept")
	public ResponseEntity<Map<String, String>> acceptProposed(
			@PathVariable("requestId") Long requestId,
			@RequestParam("driverId") Long driverId) {

		var result = assignmentService.acceptProposedByRequest(requestId, driverId);

		if (result.containsKey("FAILED")) {
			HttpStatus s = switch (result.get("FAILED")) {
			case "REQUEST_NOT_FOUND", "DRIVER_NOT_FOUND", "PROPOSAL_NOT_FOUND" -> HttpStatus.NOT_FOUND;
			case "REQUEST_ALREADY_TAKEN"  -> HttpStatus.GONE;
			case "REQUEST_ALREADY_TAKEN_2"  -> HttpStatus.EXPECTATION_FAILED;
			case "VEHICLE_TYPE_MISMATCH" -> HttpStatus.FORBIDDEN;
			case "SCHEDULE_CONFLICT" -> HttpStatus.CONFLICT;
			default -> HttpStatus.BAD_REQUEST;
			};
			return ResponseEntity.status(s).body(result);
		}
		return ResponseEntity.ok(result); // { SUCCESS: "ACCEPTED" }
	}

	// 지명 제안 ‘취소’ (양측 사용 가능).
	@PutMapping("/{requestId:\\d+}/decline")
	public ResponseEntity<Map<String, String>> cancelProposal(
			@PathVariable("requestId") Long requestId,
			@RequestParam("driverId") Long driverId) {

		var result = assignmentService.cancelProposalByRequest(requestId, driverId);

		if (result.containsKey("FAILED")) {
			HttpStatus s = switch (result.get("FAILED")) {
			case "REQUEST_NOT_FOUND", "PROPOSAL_NOT_FOUND" -> HttpStatus.NOT_FOUND;
			default -> HttpStatus.BAD_REQUEST;
			};
			return ResponseEntity.status(s).body(result);
		}
		return ResponseEntity.ok(result); // { SUCCESS: "CANCELED" }
	}

}
