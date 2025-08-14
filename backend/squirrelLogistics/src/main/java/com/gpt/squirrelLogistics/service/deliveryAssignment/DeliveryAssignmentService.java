package com.gpt.squirrelLogistics.service.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryAssignmentService {

	private final DeliveryAssignmentRepository repository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final ReviewRepository reviewRepository;
	
	
	
	public List<Date> getHistoryDate(){//completedAt 뽑기
		return repository.findOnlyCompletedAt();
	}
	

	public List<Object[]> getTodayList(String completedAt){
		return repository.findStartEndAddress(completedAt);
	}
	
	public List<Object[]> getTodayContent(String assignedId){
		List<Object[]> waypointList = deliveryWaypointRepository.findWaypointByAssignmentId(assignedId);
		List<Object[]> actualDeliveryList = repository.findActualDeliveryById(assignedId);
		List<Object[]> reviewList = repository.findReviewById(assignedId);
		List<Object[]> driverList = repository.findDriverById(assignedId);
		
		List<Object[]> todayContent = new ArrayList();
		
		todayContent.addAll(waypointList);
		todayContent.addAll(actualDeliveryList);
		todayContent.addAll(reviewList);
		todayContent.addAll(driverList);
		
		return todayContent;
	}
	

	
	

}