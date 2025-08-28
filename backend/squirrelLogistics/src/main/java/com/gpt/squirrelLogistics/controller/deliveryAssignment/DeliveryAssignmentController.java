package com.gpt.squirrelLogistics.controller.deliveryAssignment;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DriverDeliveryHistoryDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingDTO;
import com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO;
import com.gpt.squirrelLogistics.dto.review.DriverReviewCardResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;
import com.gpt.squirrelLogistics.enums.driverAction.DriverActionEnum;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DriverTokenValidService;
import com.gpt.squirrelLogistics.service.review.ReviewService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
	public ResponseEntity<DeliveryAssignmentTrackingDTO> getTodayAssignment(@RequestParam("driverId") Long driverId) {

		DeliveryAssignmentTrackingDTO result = assignmentService.getTodayAssignments(driverId);

		return ResponseEntity.ok(result);
	}

	// 현재 진행중 운송의 상태값 변경 요청.
	@PostMapping("/{assignedId}/action")
	public DeliveryAssignmentTrackingDTO applyDriverAction(@PathVariable("assignedId") Long assignedId,
			@RequestParam("action") DriverActionEnum action,
			@RequestBody(required = false) Map<String, Object> extras) {
		
	    boolean mountainous = false;
	    boolean caution = false;
	    
	    if (extras != null) {
	        mountainous = (Boolean) extras.getOrDefault("mountainous", false);
	        caution = (Boolean) extras.getOrDefault("caution", false);
	    }

		return assignmentService.applyAction(assignedId, action, mountainous, caution);

	}

	// 년/월에 소속된 일정 정보 가져오기.
	@GetMapping("/{driverId}/schedules")
	public ResponseEntity<List<DriverScheduleDTO>> getMonthlySchedule(@PathVariable("driverId") Long driverId,
			@RequestParam("year") int year, @RequestParam("month") int month) {
		List<DriverScheduleDTO> list = assignmentService.findMonthlySchedule(driverId, year, month);
		return ResponseEntity.ok(list);
	}

	// 해당 기사의 예약된 운송 기록 정보 상세 조회.
	@GetMapping("/{driverId}/reservations/{requestId}")
	public ResponseEntity<DeliveryRequestResponseDTO> readFullReserve(@PathVariable("driverId") Long driverId,
			@PathVariable("requestId") Long requestId) {
		return ResponseEntity.ok(requestService.readFull(requestId));
	}

	// 해당 기사의 완료한 운송 기록 정보 상세 조회.
	@GetMapping("/history/{assignedId}")
	public ResponseEntity<DriverDeliveryHistoryDTO> readFullHistory(
			@RequestHeader("Authorization") String token,
			@PathVariable("assignedId") Long assignedId) throws AccessDeniedException {
		
		Long driverId = tokenValidService.getDriverIdByToken(token);
		
		if(driverId == null) {
			log.info("[ERROR] 해당 아이디의 운전자가 발견되지 않았습니다: " + driverId);
			return null;
		}
		
		DeliveryAssignment assignRef = deliveryAssignmentRepository.getReferenceById(assignedId);
		
		if(assignRef == null) {
			log.info("[ERROR] 해당 아이디의 운송 할당 정보가 발견되지 않았습니다: " + assignedId);
			return null;
		}
		if(assignRef.getStatus() != StatusEnum.COMPLETED) {
			log.info("[ERROR] 해당 아이디의 운송 할당이 완료 상태가 아닙니다: " + assignRef.getStatus());
			return null;
		}
		if(assignRef.getDriver() == null || assignRef.getDriver().getDriverId() != driverId) {
			log.info("[ERROR] 해당 운전자에게 할당된 운송이 아니라 접근할 수 없습니다.");
			return null;
		}
		
		return ResponseEntity.ok(assignmentService.getHistory(assignedId));
	}

	@GetMapping("/{driverId}/reviews")
	public ResponseEntity<Page<DriverReviewCardResponseDTO>> getDriverReviews(
			@PathVariable(name = "driverId") Long driverId, @RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "10") int size) {

		Pageable pageable = PageRequest.of(page, size, Sort.by("regDate").descending());
		return ResponseEntity.ok(reviewService.getSubmittedReviews(driverId, pageable));
	}

}
