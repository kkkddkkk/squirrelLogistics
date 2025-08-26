package com.gpt.squirrelLogistics.service.deliveryCompleted;

import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.deliveryWaypoint.DeliveryWaypointService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryCompletedServiceImpl implements DeliveryCompletedService {

    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final DeliveryRequestRepository requestRepository;
    private final DeliveryWaypointRepository deliveryWaypointRepository;
    private final DeliveryAssignmentService deliveryAssignmentService;
    private final DeliveryRequestService deliveryRequestService;
    private final DeliveryWaypointService deliveryWaypointService;

    /**
     * 작성자: 임수현
     * 기능: 완료된 운송 목록 조회 (기존 DTO들을 조합하여 반환)
     */
    @Override
    public List<Map<String, Object>> getCompletedDeliveriesWithActualDelivery(Long driverId) {
        log.info("=== 완료된 운송 목록 조회 시작 ===");
        log.info("요청된 driverId: {}", driverId);
        
        List<DeliveryAssignment> allAssignments = deliveryAssignmentRepository.findAll();
        log.info("전체 delivery_assignment 수: {}", allAssignments.size());
        
        // 각 assignment의 상태 로깅
        allAssignments.forEach(assignment -> {
            if (assignment.getDriver() != null) {
                log.info("Assignment ID: {}, Driver ID: {}, Status: {}", 
                    assignment.getAssignedId(), 
                    assignment.getDriver().getDriverId(), 
                    assignment.getStatus());
            }
        });
        
        List<DeliveryAssignment> completedAssignments = allAssignments.stream()
            .filter(assignment -> assignment.getDriver() != null && assignment.getDriver().getDriverId().equals(driverId))
            .filter(assignment -> assignment.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED)
            .collect(Collectors.toList());
        
        log.info("COMPLETED 상태의 assignment 수: {}", completedAssignments.size());
        
        List<Map<String, Object>> result = completedAssignments.stream()
            .map(this::convertToCombinedDTO)
            .collect(Collectors.toList());
        
        log.info("반환할 DTO 수: {}", result.size());
        log.info("=== 완료된 운송 목록 조회 완료 ===");
        
        return result;
    }

    /**
     * 작성자: 임수현
     * 기능: 운송 상세 정보 조회 (기존 DTO들을 조합하여 반환)
     */
    @Override
    public Map<String, Object> getDeliveryDetail(Long assignedId, Long driverId) {
        List<DeliveryAssignment> allAssignments = deliveryAssignmentRepository.findAll();
        
        DeliveryAssignment targetAssignment = allAssignments.stream()
            .filter(assignment -> assignment.getDriver().getDriverId().equals(driverId))
            .filter(assignment -> assignment.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED)
            .filter(assignment -> assignment.getAssignedId().equals(assignedId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("운송 정보를 찾을 수 없습니다."));
        
        return convertToCombinedDTO(targetAssignment);
    }

    /**
     * DeliveryAssignment 엔티티 -> 기존 DTO들을 조합한 Map 변환 메서드
     */
    private Map<String, Object> convertToCombinedDTO(DeliveryAssignment assignment) {
        try {
            Long assignedId = assignment.getAssignedId();
            log.info("convertToCombinedDTO 시작: assignedId={}", assignedId);
            
            Map<String, Object> result = new HashMap<>();
            
            // 1. DeliveryAssignment 정보 (직접 변환)
            DeliveryAssignmentSlimResponseDTO assignmentDTO = convertAssignmentToDTO(assignment);
            result.put("assignment", assignmentDTO);
            
            // 2. DeliveryRequest 정보 (직접 변환)
            DeliveryRequest deliveryRequest = assignment.getDeliveryRequest();
            DeliveryRequestSlimResponseDTO requestDTO = convertRequestToDTO(deliveryRequest);
            result.put("request", requestDTO);
            
            // 3. ActualDelivery 정보
            ActualDelivery actualDelivery = assignment.getActualDelivery();
            if (actualDelivery != null) {
                ActualDeliveryDTO actualDeliveryDTO = ActualDeliveryDTO.builder()
                    .actualDeliveryId(actualDelivery.getActualDeliveryId())
                    .distance(actualDelivery.getDistance())
                    .weight(actualDelivery.getWeight())
                    .mountainous(actualDelivery.isMountainous())
                    .caution(actualDelivery.isCaution())
                    .actualFee(actualDelivery.getActualFee())
                    .build();
                result.put("actualDelivery", actualDeliveryDTO);
            }
            
            // 4. Waypoints 정보
            List<DeliveryWaypoint> waypointEntities = deliveryWaypointRepository.findAllByRequestIdOrderByDropOrderAsc(deliveryRequest.getRequestId());
            List<DeliveryWaypointSlimResponseDTO> waypoints = waypointEntities.stream()
                .map(this::convertWaypointToDTO)
                .collect(Collectors.toList());
            result.put("waypoints", waypoints);
            
            // 5. 추가 정보 (기존 ActualDeliveryListDTO에서 사용하던 정보들)
            Map<String, Object> additionalInfo = new HashMap<>();
            additionalInfo.put("assignedId", assignedId);
            additionalInfo.put("startAddress", deliveryRequest.getStartAddress());
            additionalInfo.put("endAddress", deliveryRequest.getEndAddress());
            additionalInfo.put("completedAt", assignment.getCompletedAt());
            additionalInfo.put("status", assignment.getStatus());
            
            if (actualDelivery != null) {
                additionalInfo.put("distance", actualDelivery.getDistance());
                additionalInfo.put("weight", actualDelivery.getWeight());
                additionalInfo.put("mountainous", actualDelivery.isMountainous());
                additionalInfo.put("caution", actualDelivery.isCaution());
                additionalInfo.put("actualFee", actualDelivery.getActualFee());
            }
            
            result.put("additionalInfo", additionalInfo);
            
            log.info("DTO 변환 완료: assignedId={}", assignedId);
            return result;
        } catch (Exception e) {
            log.error("convertToCombinedDTO 오류 발생: assignedId={}, 오류: {}", assignment.getAssignedId(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * DeliveryAssignment 엔티티를 DTO로 변환하는 메서드
     */
    private DeliveryAssignmentSlimResponseDTO convertAssignmentToDTO(DeliveryAssignment assignment) {
        return DeliveryAssignmentSlimResponseDTO.builder()
            .assignedId(assignment.getAssignedId())
            .assignedAt(assignment.getAssignedAt())
            .completedAt(assignment.getCompletedAt())
            .cancelledAt(assignment.getCancelledAt())
            .status(com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.ASSIGNED) // 완료된 배송은 ASSIGNED 상태로 매핑
            .deliveryRequestId(assignment.getDeliveryRequest() != null ? assignment.getDeliveryRequest().getRequestId() : null)
            .paymentId(assignment.getPayment() != null ? assignment.getPayment().getPaymentId() : null)
            .driverId(assignment.getDriver() != null ? assignment.getDriver().getDriverId() : null)
            .actualDeliveryId(assignment.getActualDelivery() != null ? assignment.getActualDelivery().getActualDeliveryId() : null)
            .build();
    }

    /**
     * DeliveryRequest 엔티티를 DTO로 변환하는 메서드
     */
    private DeliveryRequestSlimResponseDTO convertRequestToDTO(DeliveryRequest request) {
        return DeliveryRequestSlimResponseDTO.builder()
            .requestId(request.getRequestId())
            .startAddress(request.getStartAddress())
            .endAddress(request.getEndAddress())
            .memoToDriver(request.getMemoToDriver())
            .totalCargoCount(request.getTotalCargoCount())
            .totalCargoWeight(request.getTotalCargoWeight())
            .estimatedFee(request.getEstimatedFee())
            .distance(request.getDistance())
            .createAt(request.getCreateAt())
            .wantToStart(request.getWantToStart())
            .wantToEnd(request.getWantToEnd())
            .status(request.getStatus())
            .paymentId(request.getPayment() != null ? request.getPayment().getPaymentId() : null)
            .companyId(request.getCompany() != null ? request.getCompany().getCompanyId() : null)
            .vehicleTypeId(request.getVehicleType() != null ? request.getVehicleType().getVehicleTypeId() : null)
            .vehicleTypeName(request.getVehicleType() != null ? request.getVehicleType().getName() : null)
            .companyName(request.getCompany() != null && request.getCompany().getUser() != null ? 
                request.getCompany().getUser().getName() : null)
            .build();
    }

    /**
     * DeliveryWaypoint 엔티티를 DTO로 변환하는 메서드
     */
    private DeliveryWaypointSlimResponseDTO convertWaypointToDTO(DeliveryWaypoint waypoint) {
        return DeliveryWaypointSlimResponseDTO.builder()
            .waypointId(waypoint.getWaypointId())
            .dropOrder(waypoint.getDropOrder())
            .address(waypoint.getAddress())
            .arriveAt(waypoint.getArriveAt())
            .droppedAt(waypoint.getDroppedAt())
            .status(waypoint.getStatus())
            .deliveryRequestId(waypoint.getDeliveryRequest() != null ? waypoint.getDeliveryRequest().getRequestId() : null)
            .lat(BigDecimal.ZERO) // 기본값 설정 (실제로는 지오코딩 필요)
            .lng(BigDecimal.ZERO) // 기본값 설정 (실제로는 지오코딩 필요)
            .handlingId(null) // 기본값 설정
            .handlingTags(null) // 기본값 설정
            .build();
    }
} 