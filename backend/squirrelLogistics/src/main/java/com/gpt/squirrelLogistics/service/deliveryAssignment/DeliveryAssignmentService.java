package com.gpt.squirrelLogistics.service.deliveryAssignment;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.Objects;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.common.EncodedRouteSummary;
import com.gpt.squirrelLogistics.dto.actualCalc.ActualCalcDTO;
import com.gpt.squirrelLogistics.dto.company.CompanyHistoryContentDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DetailHistoryDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DriverDeliveryHistoryDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingDTO;
import com.gpt.squirrelLogistics.dto.deliveryTracking.NavigateDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryStatusLog.DeliveryStatusLog;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;
import com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum;
import com.gpt.squirrelLogistics.enums.driverAction.DriverActionEnum;
import com.gpt.squirrelLogistics.enums.payment.PayStatusEnum;
import com.gpt.squirrelLogistics.repository.actualDelivery.ActualDeliveryRepository;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryCargo.DeliveryCargoRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryStatusLog.DeliveryStatusLogRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.repository.report.ReportRepository;
import com.gpt.squirrelLogistics.service.deliveryTrackingLog.DeliveryTrackingLogService;
import com.gpt.squirrelLogistics.simulation.driver.DummyDriver;
import com.gpt.squirrelLogistics.simulation.driver.DummyTracker;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class DeliveryAssignmentService {

	private final DeliveryAssignmentRepository deliveryAssignmentRepository;
	private final DeliveryWaypointRepository deliveryWaypointRepository;
	private final ReportRepository reportRepository;

	private final PaymentRepository paymentRepository;
	private final ActualDeliveryRepository actualDeliveryRepository;

	// 작성자 고은설.
	private final DeliveryRequestRepository requestRepository;
	private final DriverRepository driverRepository;
	private final CarRepository carRepository;
	private final DeliveryCargoRepository cargoRepository;
	private final DeliveryStatusLogRepository deliveryStatusLogRepository;

	private final KakaoRouteClient routeClient;
	private final KakaoLocalClient localClient;
	private final DummyTracker dummyTracker;

	private final DeliveryTrackingLogService trackingLogService;

	// 작성자: 김도경
	// 기능: 전 목록 완수일자 뽑기
	public List<LocalDate> getHistoryDate(Long companyId) {// completedAt 뽑기
		List<Object[]> rawList = deliveryAssignmentRepository.findDateListByCompanyId(companyId);

		List<LocalDate> dates = rawList.stream().map(obj -> ((java.sql.Date) obj[0]).toLocalDate())
				.collect(Collectors.toList());

		return dates;
	}

	// 작성자: 김도경
	// 기능: 완수일자 별 출발지, 도착지
	public List<Object[]> getTodayList(LocalDate wantToStart, Long companyId) {
		return deliveryAssignmentRepository.findListHeader(wantToStart, companyId);
	}

	// 작성자: 김도경
	// 기능: 실계산 페이지 랜더링
	@Transactional
	public ActualCalcDTO getActualCalc(Long assignedId) {
		List<String> waypointList = deliveryWaypointRepository.findWaypointsByAssignmentId(assignedId);
		ActualDelivery actualDelivery = deliveryAssignmentRepository.findAllActualDeliveyById(assignedId.toString());
		Long estimatedFee = requestRepository
				.findEstimatedFeeById(deliveryAssignmentRepository.findRequestIdById(assignedId));
		String estimatedPolyline = requestRepository.findExpectedRealPolylineByAssignedId(assignedId).get();
		Long paymentId = deliveryAssignmentRepository.findFirstPaymentIdById(assignedId);

		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository.findById(assignedId)
				.orElseThrow(() -> new RuntimeException("assignment not found!"));

		if (actualDelivery == null) {

			Payment payment = paymentRepository.findByPrepaidId(paymentId).orElseGet(() -> {
				Payment newPayment = Payment.builder().prepaidId(paymentId).settlement(false)
						.payStatus(PayStatusEnum.PENDING).build();
				return paymentRepository.save(newPayment); // DB에 먼저 저장
			});

			// 이후에 assignment와 연결
			deliveryAssignment.setPayment(payment);
			deliveryAssignmentRepository.save(deliveryAssignment);

			ActualCalcDTO actualCalcDTO = ActualCalcDTO.builder().paymentId(paymentId)
					.prepaidId(paymentRepository.findPrepaidIdByPaymentId(paymentId))
					.assignedId(Long.valueOf(assignedId)).dropOrder1(waypointList.size() >= 3)
					.dropOrder2(waypointList.size() >= 4).dropOrder3(waypointList.size() >= 5).mountainous(false)
					.caution(false).distance(0L).weight(0L)
					.requestId(deliveryAssignmentRepository.findRequestIdById(assignedId)).estimateFee(estimatedFee)
					.actualPolyline(estimatedPolyline).build();

			return actualCalcDTO;
		}

		ActualCalcDTO actualCalcDTO = ActualCalcDTO.builder().paymentId(paymentId)
				.prepaidId(paymentRepository.findPrepaidIdByPaymentId(paymentId)).assignedId(Long.valueOf(assignedId))
				.dropOrder1(waypointList.size() >= 3).dropOrder2(waypointList.size() >= 4)
				.dropOrder3(waypointList.size() >= 5).mountainous(actualDelivery.isMountainous())
				.caution(actualDelivery.isCaution()).distance(actualDelivery.getDistance())
				.weight(actualDelivery.getWeight())
				.requestId(deliveryAssignmentRepository.findRequestIdById(assignedId)).estimateFee(estimatedFee)
				.actualPolyline(actualDelivery.getActualPolyline()).build();
		return actualCalcDTO;
	}

	// 작성자: 김도경
	// 완수일자 별 경유지, 리뷰, 신고, 운전자 정보를 json 형태로
	public CompanyHistoryContentDTO getTodayContent(Long assignedId) {
		List<String> waypointList = deliveryWaypointRepository.findWaypointsByAssignmentId(assignedId);
		String status = deliveryAssignmentRepository.findStatusById(assignedId).get(0);

		List<String> dropOrders = new ArrayList<>();
		if (waypointList.size() > 2) { // 목적지가 하나 이상 있는 경우
			dropOrders = waypointList.subList(1, waypointList.size() - 1);
		}

		// 실운전(산간주의, 취급주의, 실제금액)
		List<Object[]> actualDelivery = deliveryAssignmentRepository.findActualDeliveryById(assignedId);

		Object[] actualDeliveryList = actualDelivery != null && !actualDelivery.isEmpty() ? actualDelivery.get(0)
				: new Object[] { 0, 0, 0 };

		Object mountainousObj = actualDeliveryList[0];
		Object cautionObj = actualDeliveryList[1];

		boolean mountainous = false;
		boolean caution = false;
		long actualFee = actualDeliveryList[2] != null ? ((Number) actualDeliveryList[2]).longValue() : 0L;

		if (mountainousObj != null) {
			if (mountainousObj instanceof Integer) {
				mountainous = ((Integer) mountainousObj) == 1;
			} else if (mountainousObj instanceof Boolean) {
				mountainous = (Boolean) mountainousObj;
			}
		}
		if (cautionObj != null) {
			if (cautionObj instanceof Integer) {
				caution = ((Integer) cautionObj) == 1;
			} else if (cautionObj instanceof Boolean) {
				caution = (Boolean) cautionObj;
			}
		}

		// 운전자 정보(운전자 이름, 차 이름, 사진)
		List<Object[]> driver = deliveryAssignmentRepository.findDriverById(assignedId);
		Object[] driverList = driver != null && !driver.isEmpty() ? driver.get(0) : new Object[] { "", "", "" };

		String path = "";
		String fileName = "default_profile.png";
		if ((String) driverList[2] != "" && (String) driverList[2] != null) {
			path = (String) driverList[2];
			fileName = path.substring(path.lastIndexOf("/") + 1);
		}

		// 리뷰 정보(리뷰 아이디, 별점, 사유)
		List<Object[]> reviewList = deliveryAssignmentRepository.findReviewById(assignedId);
		Object[] reviewListArr = reviewList != null && !reviewList.isEmpty() ? reviewList.get(0)
				: new Object[] { 0, 0, "" };

		// 신고정보(신고 아이디)
		List<Object[]> reportList = reportRepository.findReportById(assignedId);
		Object[] reportListArr = reportList != null && !reportList.isEmpty() ? reportList.get(0) : new Object[] { 0 };

		if (status == "COMPLETED" || status == "PAYMENTCOMPLETED") {
			return CompanyHistoryContentDTO.builder().dropOrder1(dropOrders.size() > 0 ? dropOrders.get(0) : "")
					.dropOrder2(dropOrders.size() > 1 ? dropOrders.get(1) : "")
					.dropOrder3(dropOrders.size() > 2 ? dropOrders.get(2) : "").mountainous(mountainous)
					.caution(caution).actualFee(actualFee)
					.estimatedFee(deliveryAssignmentRepository.findEstimatedFeeById(assignedId))
					.reviewId(((Number) reviewListArr[0]).longValue()).rating(((Number) reviewListArr[1]).intValue())
					.reason((String) reviewListArr[2]).driverName((String) driverList[0])
					.carName((String) driverList[1]).driverImg(fileName)
					.reportId(((Number) reportListArr[0]).longValue())
					.paymentId(deliveryAssignmentRepository.findSecondPaymentIdById(assignedId))
					.prepaidId(deliveryAssignmentRepository.findFirstPaymentIdById(assignedId)).build();
		} else {
			return CompanyHistoryContentDTO.builder().dropOrder1(dropOrders.size() > 0 ? dropOrders.get(0) : "")
					.dropOrder2(dropOrders.size() > 1 ? dropOrders.get(1) : "")
					.dropOrder3(dropOrders.size() > 2 ? dropOrders.get(2) : "").mountainous(mountainous)
					.caution(caution).estimatedFee(deliveryAssignmentRepository.findEstimatedFeeById(assignedId))
					.driverName((String) driverList[0]).carName((String) driverList[1]).driverImg(fileName)
					.reportId(((Number) reportListArr[0]).longValue())
					.paymentId(deliveryAssignmentRepository.findFirstPaymentIdById(assignedId)).build();
		}
	}

	// 작성자: 김도경
	// 기능: detailHistory(예약, 운송중 세부내역 확인)
	// 수정일: 2025.09.01 고은설 => 상태값 및 경유지 정보 가져오는 구조로 수정.
	public DetailHistoryDTO getDetailHistory(Long assignedId) {

		DeliveryAssignment assignmentRef = deliveryAssignmentRepository.getReferenceById(assignedId);

		if (assignmentRef == null) {
			return null;
		}

		// Status
		List<DeliveryWaypointSlimResponseDTO> wps = deliveryAssignmentRepository
				.findWaypointsByRequest(assignmentRef.getDeliveryRequest());

		// Logs
		List<DeliveryStatusLogSlimResponseDTO> logs = deliveryAssignmentRepository.findLogsByAssignId(assignedId);

		DetailHistoryDTO detailHistoryDTO = DetailHistoryDTO.builder().assignedId(assignedId)
				.driverId(assignmentRef.getDriver().getDriverId()).waypoints(wps).statuses(logs).build();

		return detailHistoryDTO;
	}

	// 작성자: 고은설.
	// 기능: 운송 요청 수락에 따흔 운송 할당 엔티티 생성.
	// 두개 이상의 엔티티에 대한 수정이 진행되어 transactional 부착.
	@Transactional
	public Map<String, String> accept(Long requestId, Long driverId) {

		var now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
	    var proposalDeadline = now.plusHours(2);
	    
		deliveryAssignmentRepository.cancelExpiredProposalsByStartForRequest(now, proposalDeadline, requestId);
		
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
				return Map.of("FAILED", "ALREADY_ACCEPTED");
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

		if (req.getStatus() != com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED
				&& req.getStatus() != com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.PROPOSED) {
			return "REQUEST_ALREADY_TAKEN_2";
		}

		// 요청에 명시된 차량 운전자 소지 여부 확인.
		boolean isCarAvailable = carRepository.hasEligibleCar(driver.getDriverId(),
				req.getVehicleType().getVehicleTypeId());
		if (!isCarAvailable)
			return "VEHICLE_TYPE_MISMATCH";

		var blocking = List.of(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED,
				com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS);

		// 희망 시작시간 제공되지 않은 경우.
		if (req.getWantToStart() == null) {
			return null;
		}

		LocalDateTime candidateStart = req.getWantToStart();

		boolean hasConflict = deliveryAssignmentRepository.existsOverlapping24h(
		    driver.getDriverId(),
		    candidateStart.plusHours(24),  
		    candidateStart.minusHours(24),  
		    blocking
		);

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
		if (a == null)
			return Map.of("FAILED", "PROPOSAL_NOT_FOUND");

		var req = a.getDeliveryRequest();
		if (req == null)
			return Map.of("FAILED", "REQUEST_NOT_FOUND");

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
		if (err != null)
			return Map.of("FAILED", err);

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
//			if (prePayment != null) {
//				prePayment.setPayStatus(PayStatusEnum.REFUNDED);
//				prePayment.setRefundDate(LocalDateTime.now());
//				req.setPayment(null);
//			}

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

	// 오늘 시작하는 일정 정보 가져오기.
	@Transactional(readOnly = true)
	public DeliveryAssignmentTrackingDTO getTodayAssignments(Long driverId) {
		var now = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDateTime();
		var heads = deliveryAssignmentRepository.findCurrentOrDueHead(driverId, now, PageRequest.of(0, 1));
		if (heads.isEmpty())
			return null;

		var h = heads.get(0);
		Long requestId = h.getRequestId();
		Long assignId = h.getAssignedId();

		// 1) 웨이포인트 전체(START~DEST)
		var points = deliveryWaypointRepository.findAllByRequestIdOrderByDrop(requestId);

		// 2) 화물 맵 (waypointId -> cargos)
		var cargoRows = cargoRepository.findCargoOnePerWaypoint(requestId);
		Map<Long, DeliveryCargoSlimResponseDTO> cargoByWp = cargoRows.stream()
				.collect(Collectors.toMap(DeliveryCargoSlimResponseDTO::getWaypointId, Function.identity()));

		// 3) 최신 상태
//		var last = deliveryStatusLogRepository
//				.findByDeliveryAssignment_DeliveryRequest_RequestIdOrderByCreatedAtDescStatusIdDesc(requestId,
//						PageRequest.of(0, 1));

		var last = deliveryStatusLogRepository
				.findByDeliveryAssignment_AssignedIdOrderByCreatedAtDescStatusIdDesc(assignId, PageRequest.of(0, 1));
		DeliveryStatusLogSlimResponseDTO lastDto = null;
		Integer lastVisited = null;
		if (!last.isEmpty()) {
			var l = last.get(0);
			lastVisited = l.getLastVisitedWaypoint();
			lastDto = new DeliveryStatusLogSlimResponseDTO(l.getStatusId(), l.getCreatedAt(),
					l.getLastVisitedWaypoint(), l.getStatus(), null // 필요시 assignedId 세팅
			);
		}

		log.info("points: " + points.size());

		// 4) 네비게이션 구간 구성 (i -> i+1)
		List<NavigateDeliveryDTO> nav = new ArrayList<>();
		for (int i = 0; i < points.size() - 1; i++) {
			var from = points.get(i);
			var to = points.get(i + 1);

			var fromGeo = localClient.geocode(from.getAddress());
			var toGeo = localClient.geocode(to.getAddress());

			// 좌표 유효성 체크
			if (fromGeo == null || toGeo == null || fromGeo.equals(toGeo)) {
				// 경로 없음 → 안전한 기본값
				nav.add(NavigateDeliveryDTO.builder().address(to.getAddress()).expectedPolyline(null)
						.expectedRoute(null).distance(0L) // 또는 null
						.duration(0L) // 또는 null
						.waypointId(to.getDropOrder() != 0 ? to.getWaypointId() : null)
						.cargos(cargoByWp.get(to.getWaypointId())).build());
				continue;
			}

			var route = routeClient.requestRoute(fromGeo, toGeo);

			String polyline = null, routeJson = null;
			Long distance = null;
			Long duration = null;

			if (route != null) {
				try {
					routeJson = routeClient.toJsonRoute(route.getPolyline());
					polyline = routeClient.encodePolyline(route.getPolyline());

					if (route != null) {
						distance = route.getDistance();
						duration = route.getDuration();
					}
				} catch (Exception ignore) {
				}
			}

			// ✅ route가 null이거나 summary가 null이면 보수적으로 0/ null 넣기
			if (distance == null || duration == null) {
				// routeClient.calculateTotalDistance(...) 같은 2차 호출은 지양
				distance = (distance != null ? distance : 0);
				duration = (duration != null ? duration : 0);
			}

			var cargo = (to.getDropOrder() != 0) ? cargoByWp.get(to.getWaypointId()) : null;

			nav.add(NavigateDeliveryDTO.builder().address(to.getAddress()).expectedPolyline(polyline)
					.expectedRoute(routeJson).distance(distance).duration(duration)
					.waypointId(to.getDropOrder() != 0 ? to.getWaypointId() : null).cargos(cargo).build());
		}

		log.info("nav: " + nav.toString());

		return DeliveryAssignmentTrackingDTO.builder().assignedId(h.getAssignedId()).deliveryRequestId(h.getRequestId())
				.lastStatusLog(lastDto).memoToDriver(h.getMemoToDriver()).wantToStart(h.getWantToStart())
				.wantToEnd(h.getWantToEnd()).navigate(nav).build();
	}

	@Transactional
	public DeliveryAssignmentTrackingDTO applyAction(Long assignedId, DriverActionEnum action, boolean detour) {
		var assignment = deliveryAssignmentRepository.findById(assignedId)
				.orElseThrow(() -> new IllegalArgumentException("배차 없음: " + assignedId));

		var requestId = assignment.getDeliveryRequest().getRequestId();
		var points = deliveryWaypointRepository.findAllByRequestIdOrderByDropOrderAsc(requestId);
		if (points.isEmpty())
			throw new IllegalStateException("웨이포인트 없음");

		var lastOpt = deliveryStatusLogRepository
				.findFirstByDeliveryAssignment_AssignedIdOrderByCreatedAtDescStatusIdDesc(assignedId);
		var now = java.time.LocalDateTime.now();

		var last = lastOpt.orElse(null);
		var lastVisited = (last != null ? last.getLastVisitedWaypoint() : -1);
		var status = (last != null ? last.getStatus() : null);

		switch (action) {
		case START_TO_PICKUP -> {
			require(last == null, "이미 시작됨");
			insertLog(assignment, DeliveryStatusEnum.MOVING_TO_PICKUP, 0, now);

			dummyTracker.startToPickup(assignment.getDriver().getDriverId().toString(), assignedId,
					points.get(0).getAddress());
		}
		case PICKUP_COMPLETED -> {
			require(status == DeliveryStatusEnum.MOVING_TO_PICKUP, "집하 이동 중이 아님");
			insertLog(assignment, DeliveryStatusEnum.PICKUP_COMPLETED, 0, now);
			insertLog(assignment, DeliveryStatusEnum.MOVING_TO_WAYPOINT, 0, now.plusNanos(1));

			if (points.size() > 1) {
				dummyTracker.prepareLeg(assignment.getDriver().getDriverId().toString(), assignedId,
						points.get(0).getAddress(), // from (픽업)
						points.get(1).getAddress(), // to (첫 경유지)
						true, detour // AUTO
				);
			}
		}
		case ARRIVED_AT_WAYPOINT -> {
			require(status == DeliveryStatusEnum.MOVING_TO_WAYPOINT, "경유지 이동 중이 아님");
			int arriveIdx = lastVisited + 1;
			require(arriveIdx >= 1 && arriveIdx < points.size(), "도착 인덱스 범위 오류");
			insertLog(assignment, DeliveryStatusEnum.ARRIVED_AT_WAYPOINT, arriveIdx, now);

			dummyTracker.arriveNow(assignment.getDriver().getDriverId().toString());
		}
		case DROPPED_AT_WAYPOINT -> {
			require(status == DeliveryStatusEnum.ARRIVED_AT_WAYPOINT, "경유지 도착 상태가 아님");
			int k = lastVisited;
			require(k >= 1 && k < points.size(), "하차 인덱스 범위 오류");
			insertLog(assignment, DeliveryStatusEnum.DROPPED_AT_WAYPOINT, k, now);

			if (k + 1 < points.size()) {
				insertLog(assignment, DeliveryStatusEnum.MOVING_TO_WAYPOINT, k, now.plusNanos(1));
				dummyTracker.prepareLeg(assignment.getDriver().getDriverId().toString(), assignedId,
						points.get(k).getAddress(), // from (방금 드랍한 곳)
						points.get(k + 1).getAddress(), // to (다음 경유/도착)
						true, detour);
			}
		}

		case COMPLETE -> {
			int lastIdx = points.size() - 1;
			require((status == DeliveryStatusEnum.ARRIVED_AT_WAYPOINT
					|| status == DeliveryStatusEnum.DROPPED_AT_WAYPOINT) && lastVisited == lastIdx, "완료 가능한 상태/위치가 아님");
			insertLog(assignment, DeliveryStatusEnum.COMPLETED, lastVisited, now);

			completeAssignment(assignment, now);

			// 운송 종료: 더미 상태/캐시 정리 (이후 로그 저장 방지)
			dummyTracker.finishAssignment(assignment.getDriver().getDriverId().toString());
		}
		case PAUSE -> {
			insertLog(assignment, DeliveryStatusEnum.ON_HOLD, Math.max(lastVisited, 0), now);
			dummyTracker.pause(assignment.getDriver().getDriverId().toString());
		}
		// 다음 경유지 건너뛰기
		case SKIPPED_WAYPOINT -> {
			require(status == DeliveryStatusEnum.MOVING_TO_WAYPOINT, "경유지 이동 중이 아님");
			int skipIdx = lastVisited + 1;
			require(skipIdx >= 1 && (skipIdx + 1) < points.size(), "마지막 경유지는 건너뛸 수 없음");

			insertLog(assignment, DeliveryStatusEnum.MOVING_TO_WAYPOINT, skipIdx, now.plusNanos(1));
			dummyTracker.prepareLeg(assignment.getDriver().getDriverId().toString(), assignedId,
					points.get(skipIdx).getAddress(), points.get(skipIdx + 1).getAddress(), true, detour);
		}
		}

		// 최신 상태 패킷 재조립.
		return getTodayAssignments(assignment.getDriver().getDriverId());
	}

	private void insertLog(DeliveryAssignment assignment, DeliveryStatusEnum status, int lastVisited,
			LocalDateTime at) {
		var log = DeliveryStatusLog.builder().deliveryAssignment(assignment).status(status)
				.lastVisitedWaypoint(lastVisited).createdAt(at).build();
		deliveryStatusLogRepository.save(log);
	}

	private static void require(boolean cond, String msg) {
		if (!cond)
			throw new IllegalStateException(msg);
	}

	public record HandlingFlags(boolean cautious, boolean mountainous) {
	}

	private HandlingFlags getHandlingFlagsByRequestId(Long requestId) {
		var wps = deliveryWaypointRepository.findAllByRequestIdOrderByDropOrderAsc(requestId);
		if (wps == null || wps.isEmpty())
			return new HandlingFlags(false, false);

		boolean c = false, m = false;
		for (var wp : wps) {
			var cargo = cargoRepository.findByDeliveryWaypoint_WaypointId(wp.getWaypointId()).orElse(null);
			if (cargo == null || cargo.getCargoType() == null)
				continue;
			Long hid = cargo.getCargoType().getHandlingId();
			if (hid == null)
				continue;
			if (hid == 3L)
				return new HandlingFlags(true, true); // 둘 다 true.
			if (hid == 1L)
				c = true;
			if (hid == 2L)
				m = true;
		}
		return new HandlingFlags(c, m);
	}

	// 운송 완료 처리
	@Transactional
	private void completeAssignment(DeliveryAssignment a, LocalDateTime now) {
		if (a == null)
			return;
		if (a.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED)
			return;
		if (a.getStatus() != com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
				&& a.getStatus() != com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED) {
			throw new IllegalStateException("Not completable state: " + a.getStatus());
		}

		// 실제 경로 요약
		var summary = trackingLogService.extractActualRoute(a.getAssignedId(), true);

		Long weight = (long) a.getDeliveryRequest().getTotalCargoWeight();
		Long distance = summary.getDistance();

		// 핸들링 플래그 계산
		Long requestId = a.getDeliveryRequest().getRequestId();
		var flags = getHandlingFlagsByRequestId(requestId);
		boolean isCautious = flags.cautious();
		boolean isMountainous = flags.mountainous();

		Long postFee = calcPostFee(requestId, distance, weight, isCautious, isMountainous);

		// ActualDelivery 저장
		var ad = ActualDelivery.builder().distance(distance).actualPolyline(summary.getEncodedPolyline()).weight(weight)
				.actualFee(postFee).mountainous(isMountainous).caution(isCautious).build();
		ad = actualDeliveryRepository.save(ad);
		a.setActualDelivery(ad);

		// Payment 생성 (사후결제용 빈 프레임)
		Long prepaidId = (a.getDeliveryRequest() != null && a.getDeliveryRequest().getPayment() != null)
				? a.getDeliveryRequest().getPayment().getPaymentId()
				: null;

		var p = Payment.builder().payStatus(PayStatusEnum.PENDING).settlement(false).prepaidId(prepaidId)
				// .payAmount(postFee)
				.build();
		p = paymentRepository.save(p);
		a.setPayment(p);

		// 완료 처리
		a.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED);
		a.setCompletedAt(now);
	}

	private Long calcPostFee(Long requestId, Long distance, Long weight, boolean isC, boolean isM) {
		var wps = deliveryWaypointRepository.findAllByRequestIdOrderByDropOrderAsc(requestId);
		if (wps == null || wps.isEmpty())
			return 0L;

		long total = 100_000L; // 기본금

		// 1km당 3,000원 (distance: meters)
		if (distance != null && distance > 0) {
			long kmUnits = (long) Math.ceil(distance / 1000.0);
			total += kmUnits * 3_000L;
		}

		// 1톤당 30,000원 (weight: kg)
		if (weight != null && weight > 0) {
			long tonUnits = (long) Math.ceil(weight / 1000.0);
			total += tonUnits * 30_000L;
		}

		// 중간 경유지(상차/최종하차 제외)당 50,000원
		int midStops = Math.max(wps.size() - 2, 0);
		if (midStops > 0) {
			total += 50_000L * midStops;
		}

		// 취급주의/산간 각 50,000원
		if (isC)
			total += 50_000L;
		if (isM)
			total += 50_000L;

		log.info("[calcPostFee] requestId={}, distance(m)={}, weight(kg)={}, C={}, M={}, midStops={}, total={}",
				requestId, distance, weight, isC, isM, midStops, total);
		return total;
	}

//	private Long createActualDelivery(Long assignId) {
//
//		EncodedRouteSummary result = trackingLogService.extractActualRoute(assignId);
//		ActualDelivery entity = ActualDelivery.builder().distance(result.getDistance())
//				.actualPolyline(result.getEncodedPolyline()).build();
//
//		return actualDeliveryRepository.save(entity).getActualDeliveryId();
//	}
//
//	private Long createPostPayment() {
//		Payment entity = Payment.builder().payStatus(PayStatusEnum.PENDING).settlement(false).build();
//		return paymentRepository.save(entity).getPaymentId();
//	}

	// Year, Month 바로 받아 일정 정보 리턴.
	public List<DriverScheduleDTO> findMonthlySchedule(Long driverId, int year, int month) {
		// 유효성: month 1~12
		if (month < 1 || month > 12) {
			throw new IllegalArgumentException("month must be between 1 and 12");
		}

		YearMonth ym = YearMonth.of(year, month);
		LocalDateTime monthStart = ym.atDay(1).atStartOfDay();
		LocalDateTime monthEnd = ym.plusMonths(1).atDay(1).atStartOfDay(); // [start, end)

		return deliveryAssignmentRepository.findMonthlyScheduleForDriver(driverId, monthStart, monthEnd);
	}

	// 작성자: 고은설.
	// 기능: 운송 할당 번호에 대한 조회.
	@Transactional(readOnly = true)
	public DriverDeliveryHistoryDTO getHistory(Long assignId) {
		DriverDeliveryHistoryDTO dto = deliveryAssignmentRepository.findHistoryBase(assignId)
				.orElseThrow(() -> new EntityNotFoundException("Assignment not found: " + assignId));

		// Waypoints
		DeliveryAssignment assignment = deliveryAssignmentRepository.findById(assignId).orElseThrow();
		List<DeliveryWaypointSlimResponseDTO> wps = deliveryAssignmentRepository
				.findWaypointsByRequest(assignment.getDeliveryRequest());

		// Logs
		List<DeliveryStatusLogSlimResponseDTO> logs = deliveryAssignmentRepository.findLogsByAssignId(assignId);

		dto.setWaypoints(wps);
		dto.setLogs(logs);

		return dto;
	}

	// 작성자: 고은설
	// 기능: 이미 할당된 운송 정보 취소.
	@Transactional
	public Map<String, Object> cancelDeliveryReservation(Long requestId, Long requesterDriverId) {

		// 배정 엔티티 조회
		Optional<DeliveryAssignment> optAssign = deliveryAssignmentRepository.findLatestActiveByRequestId(requestId);

		// DeliveryAssignment assignment =
		// deliveryAssignmentRepository.findById(assignId).orElse(null);
		if (optAssign.isEmpty()) {
			return Map.of("FAILED", "ASSIGNMENT_NOT_FOUND");
		}

		DeliveryAssignment assignment = optAssign.get();

		// 요청 엔티티 확인
		DeliveryRequest request = assignment.getDeliveryRequest();
		if (request == null) {
			return Map.of("FAILED", "REQUEST_NOT_FOUND");
		}

		// 본인 배차만 취소 가능
		if (requesterDriverId != null) {
			Long ownerDriverId = assignment.getDriver() != null ? assignment.getDriver().getDriverId() : null;
			if (!Objects.equals(ownerDriverId, requesterDriverId)) {
				return Map.of("FAILED", "FORBIDDEN"); // 본인 배정만 취소 가능
			}
		}

		// 배정 삭제
		// deliveryAssignmentRepository.delete(assignment);

		// 삭제 대신 상태 변경.
		assignment.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.CANCELED);
		assignment.setCancelledAt(LocalDateTime.now());

		// 상태 전이: ASSIGNED -> REGISTERED
		// int updated =
		// requestRepository.turnCanceledReservationIntoRegistered(request.getRequestId());

		// 단순 상태 전이에서 조건 확인 후 요청 상태 되돌리기 (PROPOSED → REGISTERED).
		if (request.getStatus() == com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.ASSIGNED) {
			request.setStatus(com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED);
		} else {
			return Map.of("FAILED", "INVALID_STATUS");
		}

		return Map.of("SUCCESS", request.getRequestId());

	}

	public Long getLatestAssignmentIdByDriverId(Long driverId) {
		Optional<DeliveryAssignment> latestAssignId = deliveryAssignmentRepository
				.findTopByDriver_DriverIdOrderByAssignedAtDescAssignedIdDesc(driverId);

		if (latestAssignId.isEmpty()) {
			return null;
		}

		return latestAssignId.get().getAssignedId();
	}

	// 작성자: 김도경
	// 예약 취소
	@Transactional
	public void cancel(Long assignedId) {
		DeliveryAssignment deliveryAssignment = deliveryAssignmentRepository.findById(assignedId).orElseThrow();

		deliveryAssignment.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.CANCELED);
	}

}