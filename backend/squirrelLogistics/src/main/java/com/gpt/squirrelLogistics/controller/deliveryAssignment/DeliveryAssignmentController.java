package com.gpt.squirrelLogistics.controller.deliveryAssignment;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingDTO;
import com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;
import com.gpt.squirrelLogistics.enums.driverAction.DriverActionEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;
import com.gpt.squirrelLogistics.service.driverAuth.ErrorResponse;
import com.gpt.squirrelLogistics.service.review.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/delivery/assignments")
@RequiredArgsConstructor
@Log4j2
public class DeliveryAssignmentController {

	private final DeliveryAssignmentRepository deliveryAssignmentRepository;

	private final DeliveryRequestService requestService;
	private final DeliveryAssignmentService assignmentService;
	private final ReviewService reviewService;

	private final DriverTokenValidService tokenValidService;

	// 오늘 진행 운송 정보 가져오기.
	@GetMapping("/today")
	public ResponseEntity<?> getTodayAssignment(
			@RequestHeader(value = "Authorization", required = false) String authHeader) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f) {
			return toError(f);
		}

		Long driverId = ((AuthOutcome.Success) outcome).driverId();
		log.info("driverId={}", driverId);
		DeliveryAssignmentTrackingDTO result = assignmentService.getTodayAssignments(driverId);

		return ResponseEntity.ok(result);
	}

	// 현재 진행중 운송의 상태값 변경 요청.
	@PostMapping("/{assignedId}/action")
	public ResponseEntity<?> applyDriverAction(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@PathVariable("assignedId") Long assignedId, @RequestParam("action") DriverActionEnum action,
			@RequestParam(name = "detour", defaultValue = "false") boolean detour,

			@RequestBody(required = false) Map<String, Object> extras) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		boolean mountainous = Boolean.TRUE.equals(extras != null ? extras.get("mountainous") : null);
		boolean caution = Boolean.TRUE.equals(extras != null ? extras.get("caution") : null);

		var dto = assignmentService.applyAction(assignedId, action, detour);
		return ResponseEntity.ok(dto);
	}

	// 년/월에 소속된 일정 정보 가져오기.
	@GetMapping("/schedules")
	public ResponseEntity<?> getMonthlyScheduleByToken(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestParam(name = "year") int year, @RequestParam(name = "month") int month) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();
		List<DriverScheduleDTO> list = assignmentService.findMonthlySchedule(driverId, year, month);
		return ResponseEntity.ok(list);
	}

	// 해당 기사의 예약된 운송 기록 정보 상세 조회.
	@GetMapping("/reservations/{requestId}")
	public ResponseEntity<?> readFullReserveByToken(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@PathVariable("requestId") Long requestId) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		// 필요하면 여기서 driverId와 예약 소유권 검증 추가
		return ResponseEntity.ok(requestService.readFull(requestId));
	}

	// 해당 기사의 완료한 운송 기록 정보 상세 조회.
	@GetMapping("/history/{assignedId}")
	public ResponseEntity<?> readFullHistory(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@PathVariable("assignedId") Long assignedId) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();

		var opt = deliveryAssignmentRepository.findById(assignedId);
		if (opt.isEmpty()) {
			return ResponseEntity.status(404).body(ErrorResponse.of("ASSIGNMENT_NOT_FOUND", "해당 운송 할당을 찾을 수 없습니다."));
		}

		var assign = opt.get();
		if (assign.getStatus() != StatusEnum.COMPLETED) {
			return ResponseEntity.status(409).body(ErrorResponse.of("ASSIGNMENT_NOT_COMPLETED", "해당 운송은 완료 상태가 아닙니다."));
		}
		if (assign.getDriver() == null || !assign.getDriver().getDriverId().equals(driverId)) {
			return ResponseEntity.status(403).body(ErrorResponse.of("FORBIDDEN", "해당 운전자의 운송 기록이 아닙니다."));
		}

		return ResponseEntity.ok(assignmentService.getHistory(assignedId));
	}

	@GetMapping("/reviews")
	public ResponseEntity<?> getDriverReviews(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "10") int size) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f)
			return toError(f);

		Long driverId = ((AuthOutcome.Success) outcome).driverId();

		Pageable pageable = PageRequest.of(page, size, Sort.by("regDate").descending());
		return ResponseEntity.ok(reviewService.getSubmittedReviews(driverId, pageable));
	}

	// ================================================[프론트 알림용 예외처리]
	private ResponseEntity<ErrorResponse> toError(AuthOutcome.Failure f) {
		return ResponseEntity.status(f.status()).body(ErrorResponse.of(f.code().name(), f.message()));
	}

	@PutMapping("/cancel/{requestId}")
	public ResponseEntity<?> cancelReservation(
			@RequestHeader(value = "Authorization", required = false) String authHeader,
			@PathVariable("requestId") Long requestId) {

		AuthOutcome outcome = tokenValidService.resolve(authHeader);
		if (outcome instanceof AuthOutcome.Failure f) {
			return toError(f);
		}

		// 토큰에서 driverId 꺼내기
		Long driverId = ((AuthOutcome.Success) outcome).driverId();

		Map<String, Object> result = assignmentService.cancelDeliveryReservation(requestId, driverId);

		if (result.containsKey("FAILED")) {
			String code = (String) result.get("FAILED");
			// 상황에 따라 status code 맵핑
			if ("FORBIDDEN".equals(code)) {
				return ResponseEntity.status(403).body(ErrorResponse.of(code, "본인 배정만 취소할 수 있습니다."));
			}
			if ("ASSIGNMENT_NOT_FOUND".equals(code) || "REQUEST_NOT_FOUND".equals(code)) {
				return ResponseEntity.status(404).body(ErrorResponse.of(code, "해당 리소스를 찾을 수 없습니다."));
			}
			if ("INVALID_STATUS".equals(code)) {
				return ResponseEntity.status(409).body(ErrorResponse.of(code, "요청 상태가 예약취소 가능 상태가 아닙니다."));
			}
			return ResponseEntity.badRequest().body(ErrorResponse.of(code, "처리할 수 없습니다."));
		}

		return ResponseEntity.ok(result.get("SUCCESS"));

	}
}
