package com.gpt.squirrelLogistics.service.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDateTime;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;

import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class DeliveryAssignmentService {

	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final ReportRepository reportRepository;
	
    // 작성자 고은설.
    private final DeliveryRequestRepository requestRepository;
    private final DriverRepository driverRepository;
    private final CarRepository carRepository;
	
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
	
    // 작성자: 고은설.
    // 기능: 운송 요청 수락에 따흔 운송 할당 엔티티 생성.
    // 두개 이상의 엔티티에 대한 수정이 진행되어 transactional 부착.
    @Transactional
    public Map<String, String> accept(Long requestId, Long driverId) {

        // 요청 정보 + 운전자 정보 존재 여부 검사 => 로크로 트랜잭션 잠금.
        DeliveryRequest req = requestRepository.findByIdForUpdate(requestId).orElse(null);

        if (req == null) {
            return Map.of("FAILED", "REQUEST_NOT_FOUND");
        }

        Driver driver = driverRepository.findById(driverId).orElse(null);

        if (driver == null) {
            return Map.of("FAILED", "DRIVER_NOT_FOUND");
        }
        
        // 이미 활성 배정이 있는지 확인.
        var activeOpt = deliveryAssignmentRepository.findFirstActiveByRequest(requestId);
        if (activeOpt.isPresent()) {
            var active = activeOpt.get();
            if (Objects.equals(active.getDriver().getDriverId(), driverId)) {
                // 동일 기사 재요청.
                return Map.of("SUCCESS", "ALREADY_ACCEPTED");
            }
            return Map.of("FAILED", "REQUEST_ALREADY_TAKEN");
        }

        // 지명 제안(UNKNOWN)이 걸려있으면 공개 수락 차단.
        if (deliveryAssignmentRepository.existsUnknownForRequest(requestId)) {
            return Map.of("FAILED", "PROPOSED_TO_A_DRIVER");
        }

        // 요청 상태/차종/운전자 기존 스케줄 기반 수락 가능 여부 확인.
        String error = validateAcceptableCode(req, driver);

        if (error != null) {
            return Map.of("FAILED", error);
        }

        // 요청 게시물 상태 전이: 게시됨 => 할당됨.
        req.setStatus(StatusEnum.ASSIGNED);

        // 운송 할당 엔티티 생성.
        DeliveryAssignment a = DeliveryAssignment.builder().deliveryRequest(req).driver(driver)
                .status(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED)
                .assignedAt(LocalDateTime.now()).build();
        deliveryAssignmentRepository.save(a);

        return Map.of("SUCCESS", "ACCEPTED");

    }

    // 작성자: 고은설.
    // 기능: 운송 요청 정보에 명시된 내용과 운전 기사 개인 정보 대조 확인.
    private String validateAcceptableCode(DeliveryRequest req, Driver driver) {
        if (req.getStatus() != StatusEnum.REGISTERED && req.getStatus() != StatusEnum.PROPOSED)
            return "REQUEST_ALREADY_TAKEN_2";

        // 요청에 명시된 차량 운전자 소지 여부 확인.
        boolean isCarAvailable = carRepository.existsByDriverDriverIdAndVehicleTypeVehicleTypeId(driver.getDriverId(),
                req.getVehicleType().getVehicleTypeId());
        if (!isCarAvailable)
            return "VEHICLE_TYPE_MISMATCH";

        var blocking = List.of(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
                com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS);

        // 희망 시작시작, 종료 시간 제공되지 않은 경우.
        if (req.getWantToStart() == null || req.getWantToEnd() == null) {
            return null;
        }

        LocalDateTime start = req.getWantToStart();
        LocalDateTime end = req.getWantToEnd();

        boolean hasConflict = deliveryAssignmentRepository.existsOverlappingByRequestWindow(driver.getDriverId(), start, end, blocking);
        if (hasConflict)
            return "SCHEDULE_CONFLICT";

        return null; // OK
    }
    // 작성자: 고은설.
    // 기능: 물류회사에 의한 특정 기사에게 운송 요청 지명 제안.
    @Transactional
    public Map<String, Object> propose(Long requestId, Long driverId) {
        var req = requestRepository.findByIdForUpdate(requestId).orElse(null);
        if (req == null)
            return Map.of("FAILED", "REQUEST_NOT_FOUND");

        var driver = driverRepository.findById(driverId).orElse(null);
        if (driver == null)
            return Map.of("FAILED", "DRIVER_NOT_FOUND");

        // 이미 다른 기사에게 배정된 요청이면 불가.
        if (req.getStatus() == StatusEnum.ASSIGNED)
            return Map.of("FAILED", "ALREADY_ASSIGNED");

        // 동일 기사에게 이미 지명 대기(UNKNOWN)가 있으면 중복 방지.
        boolean exists = deliveryAssignmentRepository.existsByRequestAndDriverAndStatus(requestId, driverId,
                com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN);
        if (exists)
            return Map.of("FAILED", "ALREADY_PROPOSED_TO_DRIVER");

        // 요청 상태 PROPOSED로 전환.
        req.setStatus(StatusEnum.PROPOSED);

        // 지명 Assignment 생성(UNKNOWN).
        var a = DeliveryAssignment.builder().deliveryRequest(req).driver(driver)
                .status(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN).assignedAt(null).build();
        Long assignId = deliveryAssignmentRepository.save(a).getAssignedId();

        return Map.of("SUCCESS", "PROPOSED", "assignmentId", assignId);
    }

    // 작성자: 고은설.
    // 기능: 운전기사에 의한 지명 제안 수락.
    @Transactional
    public Map<String, String> acceptProposedByRequest(Long requestId, Long driverId) {
        var a = deliveryAssignmentRepository.findUnknownForUpdateByRequestAndDriver(requestId, driverId).orElse(null);
        if (a == null) return Map.of("FAILED", "PROPOSAL_NOT_FOUND");

        var req = a.getDeliveryRequest();
        if (req == null) return Map.of("FAILED", "REQUEST_NOT_FOUND");

        // 본인 제안인지 확인.
        if (a.getDriver() == null || !Objects.equals(a.getDriver().getDriverId(), driverId)) {
            return Map.of("FAILED", "FORBIDDEN");
        }

        // 이미 배정된 경우 예외처리.
        if (a.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED
            || a.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS) {

            // 같은 기사면 ALREADY_ACCEPTED로.
            if (Objects.equals(a.getDriver().getDriverId(), driverId)) {
                return Map.of("SUCCESS", "ALREADY_ACCEPTED");
            }
            // 다른 기사의 인터셉트 막기.
            return Map.of("FAILED", "REQUEST_ALREADY_TAKEN");
        }

        // 제안 상태만 수락 가능.
        if (a.getStatus() != com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN) {
            return Map.of("FAILED", "INVALID_STATE");
        }

        // 수락 가능 여부 검증(차종/스케줄 등).
        String err = validateAcceptableCode(req, a.getDriver());
        if (err != null) return Map.of("FAILED", err);

        // 상태 전이 (요청/할당).
        req.setStatus(com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.ASSIGNED);
        a.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED);
        a.setAssignedAt(LocalDateTime.now());

        return Map.of("SUCCESS", "ACCEPTED");
    }

    // 작성자: 고은설.
    // 기능: 양측 모두에 의한 지명 제안 취소.
    @Transactional
    public Map<String, String> cancelProposalByRequest(Long requestId, Long driverId) {
        var a = deliveryAssignmentRepository.findUnknownForUpdateByRequestAndDriver(requestId, driverId).orElse(null);
        
        if (a == null)
            return Map.of("FAILED", "PROPOSAL_NOT_FOUND");

        var req = a.getDeliveryRequest();
        if (req == null)
            return Map.of("FAILED", "REQUEST_NOT_FOUND");

        // 기사 본인만 거절하 가능.
        if (a.getDriver() != null && !Objects.equals(a.getDriver().getDriverId(), driverId)) {
            return Map.of("FAILED", "FORBIDDEN");
        }

        switch (a.getStatus()) {
        case CANCELED:
            return Map.of("SUCCESS", "CANCELED");

        case UNKNOWN:
            // 환불 기간 지나면 취소/환불 불가 => 프론트 1차 방어, 여기서 2차 가드.
            var prePayment = req.getPayment();
            if (prePayment != null && prePayment.getRefundDate() != null
                    && LocalDateTime.now().isAfter(prePayment.getRefundDate())) {
                return Map.of("FAILED", "REFUND_WINDOW_PASSED");
            }

            // 제안 취소.
            a.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.CANCELED);
            a.setCancelledAt(LocalDateTime.now());

            // 요청 상태 되돌리기 (PROPOSED → REGISTERED).
            if (req.getStatus() == com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.PROPOSED) {
                req.setStatus(com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED);
            }

            // 결제 환불/연결 해제.
            if (prePayment != null) {
                prePayment.setPayStatus(PayStatusEnum.REFUNDED);
                prePayment.setRefundDate(LocalDateTime.now());
                req.setPayment(null);
            }

            return Map.of("SUCCESS", "CANCELED");

        case ASSIGNED:
        case IN_PROGRESS:
            return Map.of("FAILED", "REQUEST_ASSIGNED_COMPLETE"); // 진행 중/배정 상태는 거절이 아닌 다른 절차

        default:
            return Map.of("FAILED", "INVALID_STATE");
        }
    }

    @Transactional
    public Long create(DeliveryRequest request, Driver driver, DeliveryAssignmentRequestDTO dto) {
        return deliveryAssignmentRepository.save(reqToEntity(request, driver, dto)).getAssignedId();
    }

    private DeliveryAssignment reqToEntity(DeliveryRequest request, Driver driver, DeliveryAssignmentRequestDTO dto) {

        return DeliveryAssignment.builder().assignedAt(dto.getAssignedAt()).status(dto.getStatus())
                .deliveryRequest(request).driver(driver).build();
    }

    private DeliveryAssignmentSlimResponseDTO entityToSlimDTO(DeliveryAssignment entity) {

        return DeliveryAssignmentSlimResponseDTO.builder().build();
    }

    public List<DeliveryAssignmentProposalListDTO> getProposals(Long driverId) {
        var proposal = deliveryAssignmentRepository.findAllUnknownByDriver(driverId);
        return proposal;
    }
    
    //오늘 시작하는 일정 정보 가져오기.
    public DeliveryAssignmentSlimResponseDTO getTodayAssignments(Long driverId) {
        Optional<DeliveryAssignment> opt = deliveryAssignmentRepository.findFirstByDriverDriverIdAndStatusAndDeliveryRequest_WantToStartLessThanEqualAndDeliveryRequest_WantToEndGreaterThanEqualOrderByDeliveryRequest_WantToStartAsc
                (driverId, com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS, LocalDateTime.now(), LocalDateTime.now());

        if(opt.isPresent()) {
            return entityToSlimDTO(opt.get());
        }else {
            return null;
        }
        
    }

	
	

}