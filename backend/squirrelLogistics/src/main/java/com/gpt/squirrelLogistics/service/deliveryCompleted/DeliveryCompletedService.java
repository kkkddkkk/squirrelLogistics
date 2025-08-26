package com.gpt.squirrelLogistics.service.deliveryCompleted;

import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;

import java.util.List;
import java.util.Map;

public interface DeliveryCompletedService {
    
    /**
     * 작성자: 임수현
     * 기능: 완료된 운송 목록 조회 (기존 DTO들을 조합하여 반환)
     */
    List<Map<String, Object>> getCompletedDeliveriesWithActualDelivery(Long driverId);
    
    /**
     * 작성자: 임수현
     * 기능: 운송 상세 정보 조회 (기존 DTO들을 조합하여 반환)
     */
    Map<String, Object> getDeliveryDetail(Long assignedId, Long driverId);
    

    

} 