package com.gpt.squirrelLogistics.service.deliveryAssignment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointResponseDTO;
import com.gpt.squirrelLogistics.dto.driver.DriverRequestDTO;
import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.review.ReviewRequestDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.entity.review.Review;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryAssignmentService {

	private final DeliveryAssignmentRepository repository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final ReviewRepository reviewRepository;

	public List<DeliveryAssignmentSlimResponseDTO> getAllHistory() {
		List<DeliveryAssignment> list = repository.findAll();

		return list.stream().map(entity -> {

			DeliveryRequestResponseDTO deliveryRequestResponseDTO = new DeliveryRequestResponseDTO();
			deliveryRequestResponseDTO.setRequestId(entity.getDeliveryRequest().getRequestId());

			//배송요청에 따른 경유지 목록
			List<DeliveryWaypoint> wayPointList = deliveryWaypointRepository
					.findAllByDeliveryRequest_RequestId(deliveryRequestResponseDTO.getRequestId());
			//을 DTO로
		    List<DeliveryWaypointResponseDTO> waypointDTOs = wayPointList.stream()
		            .map(w -> DeliveryWaypointResponseDTO.builder()
		                .deliveryRequest(deliveryRequestResponseDTO)
		                .waypointId(w.getWaypointId())
		                .address(w.getAddress())
		                .dropOrder(w.getDropOrder())
		                .build())
		            .toList();
		    
		    //리뷰
		    long reviewId;
		    int rate;
		    Optional<Review> optionalReview = reviewRepository.findAllByDeliveryAssignment_AssignedId(entity.getAssignedId());
		    if(optionalReview.isEmpty()) {
		    	reviewId = 0;
		    	rate = 0;
		    }else {
		    	reviewId = optionalReview.get().getReviewId();
		    	rate = optionalReview.get().getRating();
		    }
		    
			DeliveryAssignmentSlimResponseDTO dto = DeliveryAssignmentSlimResponseDTO.builder()
					.assignedId(entity.getAssignedId())//운송기록ID
					.completedAt(entity.getCompletedAt())//도착시간
					.startAddress(entity.getDeliveryRequest().getStartAddress())//출발지
					.endAddress(entity.getDeliveryRequest().getEndAddress())//도착지
					.paymentId(entity.getPayment().getPaymentId())//결제ID
					.driverName(entity.getDriver().getUser().getName())//운전자이름
//					.profileImageName(null)//운전자 사진
					.carName(entity.getDeliveryRequest().getVehicleType().getName())//차량이름
					.mountainous(entity.getActualDelivery().isMountainous())//산간지역여부
					.caution(entity.getActualDelivery().isCaution())//취급주의여부
					.actualFee(entity.getActualDelivery().getActualFee())//실제금액
					.waypoints(waypointDTOs)//경유지리스트
					.reviewId(reviewId)//리뷰아이디
					.rating(rate)//평점
					.build();

			return dto;
		}).collect(Collectors.toList());
	}

}