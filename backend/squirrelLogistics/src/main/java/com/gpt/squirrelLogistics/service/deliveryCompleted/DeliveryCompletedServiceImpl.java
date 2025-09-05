package com.gpt.squirrelLogistics.service.deliveryCompleted;

import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointWithCargoDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.entity.cargoType.CargoType;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryStatusLog.DeliveryStatusLog;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryCargo.DeliveryCargoRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryStatusLog.DeliveryStatusLogRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.service.deliveryAssignment.DeliveryAssignmentService;
import com.gpt.squirrelLogistics.service.deliveryRequest.DeliveryRequestService;
import com.gpt.squirrelLogistics.service.deliveryWaypoint.DeliveryWaypointService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
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
	private final DeliveryCargoRepository deliveryCargoRepository;
	private final DeliveryStatusLogRepository deliveryStatusLogRepository;

	private final DeliveryAssignmentService deliveryAssignmentService;
	private final DeliveryRequestService deliveryRequestService;
	private final DeliveryWaypointService deliveryWaypointService;

	/**
	 * 작성자: 임수현 기능: 완료된 운송 목록 조회 (기존 DTO들을 조합하여 반환)
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
				log.info("Assignment ID: {}, Driver ID: {}, Status: {}", assignment.getAssignedId(),
						assignment.getDriver().getDriverId(), assignment.getStatus());
			}
		});

		List<DeliveryAssignment> completedAssignments = allAssignments.stream().filter(
				assignment -> assignment.getDriver() != null && assignment.getDriver().getDriverId().equals(driverId))
				.filter(assignment -> assignment
						.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED)
				.collect(Collectors.toList());

		log.info("COMPLETED 상태의 assignment 수: {}", completedAssignments.size());

		List<Map<String, Object>> result = completedAssignments.stream().map(this::convertToCombinedDTO)
				.collect(Collectors.toList());

		log.info("반환할 DTO 수: {}", result.size());
		log.info("=== 완료된 운송 목록 조회 완료 ===");

		return result;
	}

	/**
	 * 작성자: 임수현 기능: 운송 상세 정보 조회 (기존 DTO들을 조합하여 반환)
	 */
	@Override
	public Map<String, Object> getDeliveryDetail(Long assignedId, Long driverId) {
		List<DeliveryAssignment> allAssignments = deliveryAssignmentRepository.findAll();

		log.info("assignedId: {}, driverId: {}", assignedId, driverId);
		DeliveryAssignment targetAssignment = allAssignments.stream()
				.filter(assignment -> assignment.getDriver().getDriverId().equals(driverId))
				.filter(assignment -> assignment
						.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED)
				.filter(assignment -> assignment.getAssignedId().equals(assignedId)).findFirst()
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
						.actualDeliveryId(actualDelivery.getActualDeliveryId()).distance(actualDelivery.getDistance())
						.weight(actualDelivery.getWeight()).mountainous(actualDelivery.isMountainous())
						.caution(actualDelivery.isCaution()).actualFee(actualDelivery.getActualFee())
						.actualPolyline(actualDelivery.getActualPolyline()).build();
				result.put("actualDelivery", actualDeliveryDTO);
			}

			// 4. Waypoints 정보
			List<DeliveryWaypoint> waypointEntities = deliveryWaypointRepository
					.findAllByRequestIdOrderByDropOrderAsc(deliveryRequest.getRequestId());

			// 4-1. 경유지 id 수집.
			List<Long> waypointIds = waypointEntities.stream().map(DeliveryWaypoint::getWaypointId)
					.collect(Collectors.toList());

			// 4-2. 경유지별 하차 화물 일괄 로딩
			List<DeliveryCargo> cargos = waypointIds.isEmpty() ? Collections.emptyList()
					: deliveryCargoRepository.findByDeliveryWaypoint_WaypointIdIn(waypointIds);

			Map<Long, DeliveryCargo> cargoByWaypointId = cargos.stream()
					.collect(Collectors.toMap(c -> c.getDeliveryWaypoint().getWaypointId(), c -> c));

			// 4-3. 로그로부터 경유지 하차 시간 추출.
			Map<Integer, LocalDateTime> droppedAtByWaypoint = buildDroppedAtByWaypoint(assignedId);

			//4-4. 경유지 정보 전체 조립.
			List<DeliveryWaypointWithCargoDTO> waypointDTOs = waypointEntities.stream().map(wp -> {
				
				DeliveryWaypointSlimResponseDTO wpSlim = convertWaypointToDTO(wp);
				
				LocalDateTime droppedAtFromLog = droppedAtByWaypoint.getOrDefault(wp.getDropOrder(), null);
				
				DeliveryCargoSlimResponseDTO cargoDto = null;
				DeliveryCargo cargo = cargoByWaypointId.get(wp.getWaypointId());
				if(cargo != null) {
					CargoType ct = cargo.getCargoType();
					cargoDto = DeliveryCargoSlimResponseDTO.builder()
							.cargoId(cargo.getCargoId())
							.description(cargo.getDescription())
							.handlingId(ct != null ? ct.getHandlingId() : null)
							.handlingTags(ct != null ? ct.getHandlingTags() : null).build();
				}
				
				return DeliveryWaypointWithCargoDTO.
						builder()
						.waypoint(wpSlim)
						.droppedAtFromLog(droppedAtFromLog)
						.cargo(cargoDto)
						.build();
			}).collect(Collectors.toList());

			result.put("waypoints", waypointDTOs);

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
			log.error("convertToCombinedDTO 오류 발생: assignedId={}, 오류: {}", assignment.getAssignedId(), e.getMessage(),
					e);
			throw e;
		}
	}

	// 작성자: 고은설.
	// 기능: 상태 로그에서 하차, 도착 시간 추출 후 경유지 정보에 매핑.
	// 사용처: 운전자 페이지 이용 내역 상세 보기.
	private Map<Integer, LocalDateTime> buildDroppedAtByWaypoint(Long assignedId) {

		List<DeliveryStatusLog> logs = deliveryStatusLogRepository
				.findByDeliveryAssignment_AssignedIdOrderByCreatedAtAsc(assignedId);

		Map<Integer, LocalDateTime> map = new HashMap<>();
		LocalDateTime pickupCompletedAt = null;

		for (DeliveryStatusLog log : logs) {
			switch (log.getStatus()) {
			case PICKUP_COMPLETED:
				// 상차 완료 시각(waypoint 0에 사용)
				pickupCompletedAt = log.getCreatedAt();
				break;
			case DROPPED_AT_WAYPOINT:
				// 마지막 완료 경유지 번호 기준으로 기록
				map.put(log.getLastVisitedWaypoint(), log.getCreatedAt());
				break;
			default:
				// 필요시 추가 상태 처리
			}
		}

		if (pickupCompletedAt != null) {
			map.put(0, pickupCompletedAt);
		}
		return map;
	}

	// 작성자: 고은설.
	// 기능: 경유지 하차 화물에 따른 특수요금 적용 여부 추출.
	// 사용처: 운전자 페이지 이용 내역 상세 보기.
	private static class Flags {
		boolean isCautious;
		boolean isMountainous;
	}

	private Flags computeFlagsFromCargos(Collection<DeliveryCargo> cargos) {
		Flags f = new Flags();
		for (DeliveryCargo c : cargos) {
			CargoType t = c.getCargoType();
			if (t == null)
				continue;
			Long id = t.getHandlingId();
			if (id == null)
				continue;

			if (id == 1L) {
				f.isCautious = true;
			} else if (id == 2L) {
				f.isMountainous = true;
			} else if (id == 3L) {
				f.isCautious = true;
				f.isMountainous = true;
			}
			// 조기 종료.
			if (f.isCautious && f.isMountainous)
				break;
		}
		return f;
	}

	/**
	 * DeliveryAssignment 엔티티를 DTO로 변환하는 메서드
	 */
	private DeliveryAssignmentSlimResponseDTO convertAssignmentToDTO(DeliveryAssignment assignment) {
		return DeliveryAssignmentSlimResponseDTO.builder().assignedId(assignment.getAssignedId())
				.assignedAt(assignment.getAssignedAt()).completedAt(assignment.getCompletedAt())
				.cancelledAt(assignment.getCancelledAt())
				.status(com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.ASSIGNED) // 완료된 배송은 ASSIGNED 상태로 매핑
				.deliveryRequestId(
						assignment.getDeliveryRequest() != null ? assignment.getDeliveryRequest().getRequestId() : null)
				.paymentId(assignment.getPayment() != null ? assignment.getPayment().getPaymentId() : null)
				.driverId(assignment.getDriver() != null ? assignment.getDriver().getDriverId() : null)
				.actualDeliveryId(
						assignment.getActualDelivery() != null ? assignment.getActualDelivery().getActualDeliveryId()
								: null)
				.build();
	}

	/**
	 * DeliveryRequest 엔티티를 DTO로 변환하는 메서드
	 */
	private DeliveryRequestSlimResponseDTO convertRequestToDTO(DeliveryRequest request) {
		return DeliveryRequestSlimResponseDTO.builder().requestId(request.getRequestId())
				.startAddress(request.getStartAddress()).endAddress(request.getEndAddress())
				.memoToDriver(request.getMemoToDriver()).totalCargoCount(request.getTotalCargoCount())
				.totalCargoWeight(request.getTotalCargoWeight()).estimatedFee(request.getEstimatedFee())
				.distance(request.getDistance()).createAt(request.getCreateAt()).wantToStart(request.getWantToStart())
				.wantToEnd(request.getWantToEnd()).status(request.getStatus())
				.paymentId(request.getPayment() != null ? request.getPayment().getPaymentId() : null)
				.companyId(request.getCompany() != null ? request.getCompany().getCompanyId() : null)
				.vehicleTypeId(request.getVehicleType() != null ? request.getVehicleType().getVehicleTypeId() : null)
				.vehicleTypeName(request.getVehicleType() != null ? request.getVehicleType().getName() : null)
				.companyName(request.getCompany() != null && request.getCompany().getUser() != null
						? request.getCompany().getUser().getName()
						: null)
				.build();
	}

	/**
	 * DeliveryWaypoint 엔티티를 DTO로 변환하는 메서드
	 */
	private DeliveryWaypointSlimResponseDTO convertWaypointToDTO(DeliveryWaypoint waypoint) {
		return DeliveryWaypointSlimResponseDTO.builder().waypointId(waypoint.getWaypointId())
				.dropOrder(waypoint.getDropOrder()).address(waypoint.getAddress()).arriveAt(waypoint.getArriveAt())
				.droppedAt(waypoint.getDroppedAt()).status(waypoint.getStatus())
				.deliveryRequestId(
						waypoint.getDeliveryRequest() != null ? waypoint.getDeliveryRequest().getRequestId() : null)
				.lat(BigDecimal.ZERO) // 기본값 설정 (실제로는 지오코딩 필요)
				.lng(BigDecimal.ZERO) // 기본값 설정 (실제로는 지오코딩 필요)
				.handlingId(null) // 기본값 설정
				.handlingTags(null) // 기본값 설정
				.build();
	}
}