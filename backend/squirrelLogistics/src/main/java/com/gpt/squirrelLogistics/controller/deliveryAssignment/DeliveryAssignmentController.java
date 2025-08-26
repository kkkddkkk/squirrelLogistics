package com.gpt.squirrelLogistics.controller.deliveryAssignment;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingDTO;
import com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO;
import com.gpt.squirrelLogistics.dto.review.DriverReviewCardResponseDTO;
import com.gpt.squirrelLogistics.enums.driverAction.DriverActionEnum;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
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

	private final DeliveryRequestService requestService;
	private final DeliveryAssignmentService assignmentService;
    private final ReviewService reviewService;

	// 오늘 진행 운송 정보 가져오기.
	@GetMapping("/today")
	public ResponseEntity<DeliveryAssignmentTrackingDTO> getTodayAssignment(@RequestParam("driverId") Long driverId) {

		DeliveryAssignmentTrackingDTO result = assignmentService.getTodayAssignments(driverId);

		return ResponseEntity.ok(result);
	}

	// 현재 진행중 운송의 상태값 변경 요청.
	@PostMapping("/{assignedId}/action")
	public DeliveryAssignmentTrackingDTO applyDriverAction(@PathVariable("assignedId") Long assignedId,
			@RequestParam("action") DriverActionEnum action) {
		DeliveryAssignmentTrackingDTO thisTrack = assignmentService.applyAction(assignedId, action);
		return thisTrack;
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
	public ResponseEntity<DeliveryRequestResponseDTO> readFullReserve(
			@PathVariable("driverId") Long driverId,
			@PathVariable("requestId") Long requestId) {
		return ResponseEntity.ok(requestService.readFull(requestId));
	}

	// 해당 기사의 완료한 운송 기록 정보 상세 조회.
	@GetMapping("/{driverId}/history/{assignedId}")
	public ResponseEntity<DeliveryRequestResponseDTO> readFullHistory(
			@PathVariable("driverId") Long driverId,
			@PathVariable("assignedId") Long assignedId) {
		return ResponseEntity.ok(requestService.readFull(assignedId));
	}
	
	
    @GetMapping("/{driverId}/reviews")
    public ResponseEntity<Page<DriverReviewCardResponseDTO>> getDriverReviews(
    		@PathVariable(name = "driverId") Long driverId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("regDate").descending());
        return ResponseEntity.ok(reviewService.getSubmittedReviews(driverId, pageable));
    }

}
