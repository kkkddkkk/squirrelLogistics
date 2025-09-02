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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthErrorCode;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.ErrorResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/delivery/proposals")
@RequiredArgsConstructor
@Log4j2
public class DeliveryProposalController {

	private final DeliveryAssignmentService assignmentService;
	private final DriverTokenValidService tokenValidService;

	// 나에게 온 지명 제안 목록 (driverId 필수 쿼리파라미터).
	@GetMapping
	public ResponseEntity<?> getMyProposals(
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		log.info("!!!!!==============================getMyProposals============================================");
		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();
		log.info("!!!!!==============================getMyProposals============================================");

		log.info("!!!!!driverId={}", driverId);
		var result = assignmentService.getProposals(driverId);
		return ResponseEntity.ok(result);
	}

	// 기존 공개요청 → 특정 기사에게 지명 제안 생성 (회사 전용).
	@PutMapping("/requests/{requestId}/propose")
	public ResponseEntity<?> proposeToDriver(@PathVariable("requestId") Long requestId,
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestParam(value = "expireAt", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expireAt) {

		if (expireAt == null)
			expireAt = LocalDateTime.now().plusDays(3);

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();

		var result = assignmentService.propose(requestId, driverId);

		if (result.containsKey("FAILED")) {
			switch (result.get("FAILED").toString()) {
			case "REQUEST_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.REQUEST_NOT_FOUND.toString());
			case "DRIVER_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.DRIVER_NOT_FOUND.toString());
			case "REQUEST_ALREADY_TAKEN":
				return ResponseEntity.status(HttpStatus.CONFLICT).body(AuthErrorCode.REQUEST_ALREADY_TAKEN.toString());
			default:
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthErrorCode.UNKNOWN.toString());
			}
		}

		return ResponseEntity
				.ok(Map.of("SUCCESS", "PROPOSED", "assignmentId", result.get("assignmentId"), "expireAt", expireAt));
	}

	// 지명 제안 ‘수락’ (기사 전용).
	@PutMapping("/{requestId}/accept")
	public ResponseEntity<?> acceptProposed(@PathVariable("requestId") Long requestId,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();

		var result = assignmentService.acceptProposedByRequest(requestId, driverId);

		if (result.containsKey("FAILED")) {
			switch (result.get("FAILED").toString()) {
			case "REQUEST_NOT_FOUND", "PROPOSAL_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.REQUEST_NOT_FOUND.toString());

			case "DRIVER_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.DRIVER_NOT_FOUND.toString());

			case "REQUEST_ALREADY_TAKEN", "REQUEST_ALREADY_TAKEN_2":
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(AuthErrorCode.REQUEST_ALREADY_TAKEN.toString());

			case "VEHICLE_TYPE_MISMATCH":
				return ResponseEntity.status(HttpStatus.CONFLICT).body(AuthErrorCode.VEHICLE_TYPE_MISMATCH.toString());

			case "SCHEDULE_CONFLICT":
				return ResponseEntity.status(HttpStatus.CONFLICT).body(AuthErrorCode.SCHEDULE_CONFLICT.toString());

			default:
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthErrorCode.UNKNOWN.toString());
			}
		}
		return ResponseEntity.ok(result); 
	}

	// 지명 제안 ‘취소’ (양측 사용 가능).
	@PutMapping("/{requestId}/decline")
	public ResponseEntity<?> cancelProposal(
			@PathVariable("requestId") Long requestId,
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();
		
		var result = assignmentService.cancelProposalByRequest(requestId, driverId);

		if (result.containsKey("FAILED")) {
			switch (result.get("FAILED").toString()) {
			case "REQUEST_NOT_FOUND", "PROPOSAL_NOT_FOUND":
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body(AuthErrorCode.REQUEST_NOT_FOUND.toString());
			default:
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(AuthErrorCode.UNKNOWN.toString());
			}
		}
		return ResponseEntity.ok(result); // { SUCCESS: "CANCELED" }
	}

	// ================================================[프론트 알림용 예외처리]
	private ResponseEntity<ErrorResponse> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(ErrorResponse.of(f.code().name(), f.message()));
	}

}
