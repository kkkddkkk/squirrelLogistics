package com.gpt.squirrelLogistics.service.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
import com.gpt.squirrelLogistics.repository.report.ReportRepository;
import com.gpt.squirrelLogistics.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryAssignmentService {

	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final ReportRepository reportRepository;
	
	public List<Date> getHistoryDate(){//completedAt 뽑기
		return deliveryAssignmentRepository.findOnlyCompletedAt();
	}
	

	public List<Object[]> getTodayList(String completedAt){
		return deliveryAssignmentRepository.findStartEndAddress(completedAt);
	}
	
	//경유지를 json 형태로
	public Map<String, Object> getTodayContent(String assignedId){
		List<Object[]> waypointList = deliveryWaypointRepository.findWaypointByAssignmentId(assignedId);
		Object[] actualDeliveryList = deliveryAssignmentRepository.findActualDeliveryById(assignedId).get(0);
		List<Object[]> reviewList = deliveryAssignmentRepository.findReviewById(assignedId);
		Object[] reviewListArr;
		Object[] driverList = deliveryAssignmentRepository.findDriverById(assignedId).get(0);
		List<Object[]> reportList = reportRepository.findReportById(assignedId);
		Object[] reportListArr;
		
		if (reviewList != null && !reviewList.isEmpty()) {
		    reviewListArr = reviewList.get(0);
		} else {
		    reviewListArr = new Object[]{0, 0, ""};
		}
		
		if (reportList != null && !reportList.isEmpty()) {
			reportListArr = reportList.get(0);
		} else {
			reportListArr = new Object[]{0};
		}
		
	    Map<String, Object> map = new LinkedHashMap<>();
	    for (Object[] row : waypointList) {
	        map.put("dropOrder" + row[0], row[1]);
	    }
		
		Object[] todayContent = new Object[actualDeliveryList.length + reviewListArr.length + driverList.length+ reportListArr.length];
		int pos = 0;
		for (Object o : actualDeliveryList) todayContent[pos++] = o;
		for (Object o : reviewListArr) todayContent[pos++] = o;
		for (Object o : driverList) todayContent[pos++] = o;
		for (Object o : reportListArr) todayContent[pos++] = o;
		
		String[] keys= {"mountainous", "caution", "actualFee", "reviewId", "rating", "reason", "driverName", "carName", "reportId"};
		
		for(int i=0;i<todayContent.length;i++) {
			if(todayContent[i]!=null) {
				map.put(keys[i], todayContent[i]);
			}else {
				map.put(keys[i], null);
			}

		}
		
	    return map;
	}
	
	public Map<String, Object> getActualCalc(String assignedId){
		List<Object[]> waypointList = deliveryWaypointRepository.findWaypointByAssignmentId(assignedId);
		Object[] actualDeliveryList = deliveryAssignmentRepository.findActualDeliveryById(assignedId).get(0);
		return null;
	}
	
	
	

	
	

}