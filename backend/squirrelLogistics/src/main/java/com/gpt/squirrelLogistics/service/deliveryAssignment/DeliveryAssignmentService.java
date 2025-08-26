package com.gpt.squirrelLogistics.service.deliveryAssignment;

import java.sql.Date;
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
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentProposalListDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryAssignment.DeliveryAssignmentSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.actualDelivery.ActualDelivery;
import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryTracking.DeliveryAssignmentTrackingDTO;
import com.gpt.squirrelLogistics.dto.deliveryTracking.NavigateDeliveryDTO;
import com.gpt.squirrelLogistics.dto.driverSchedule.DriverScheduleDTO;
import com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryStatusLog.DeliveryStatusLog;
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
	public List<Date> getHistoryDate() {// completedAt 뽑기

		return deliveryAssignmentRepository.findOnlyCompletedAt();
	}

	// 작성자: 김도경
	// 기능: 완수일자 별 출발지, 도착지
	public List<Object[]> getTodayList(String completedAt) {
		return deliveryAssignmentRepository.findStartEndAddress(completedAt);
	}

	// 작성자: 김도경
	// 기능: 실계산 페이지 랜더링
	public ActualCalcDTO getActualCalc(Long assignedId) {
		List<Object[]> waypointList = deliveryWaypointRepository.findWaypointByAssignmentId(assignedId.toString());
		ActualDelivery actualDelivery = deliveryAssignmentRepository.findAllActualDeliveyById(assignedId.toString());
		Long estimatedFee = requestRepository
				.findEstimatedFeeById(deliveryAssignmentRepository.findRequestIdById(assignedId));
		Long paymentId = deliveryAssignmentRepository.findFirstPaymentIdById(assignedId);

		log.info(actualDelivery.toString());
		ActualCalcDTO actualCalcDTO = ActualCalcDTO.builder().paymentId(paymentId)
				.prepaidId(paymentRepository.findPrepaidIdByPaymentId(paymentId)).assignedId(Long.valueOf(assignedId))
				.dropOrder1(waypointList.size() == 1).dropOrder2(waypointList.size() == 2)
				.dropOrder3(waypointList.size() == 3).mountainous(actualDelivery.isMountainous())
				.caution(actualDelivery.isCaution()).distance(actualDelivery.getDistance())
				.weight(actualDelivery.getWeight())
				.actualPolyline(actualDelivery.getActualPolyline())
				.requestId(deliveryAssignmentRepository.findRequestIdById(assignedId)).estimateFee(estimatedFee)
				.build();
		return actualCalcDTO;
	}

	// 작성자: 김도경
	// 완수일자 별 경유지, 리뷰, 신고, 운전자 정보를 json 형태로
	public Map<String, Object> getTodayContent(String assignedId) {

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
			reviewListArr = new Object[] { 0, 0, "" };
		}

		if (reportList != null && !reportList.isEmpty()) {
			reportListArr = reportList.get(0);
		} else {
			reportListArr = new Object[] { 0 };
		}

		Map<String, Object> map = new LinkedHashMap<>();
		for (Object[] row : waypointList) {
			map.put("dropOrder" + row[0], row[1]);
		}

		Object[] todayContent = new Object[actualDeliveryList.length + reviewListArr.length + driverList.length
				+ reportListArr.length];
		int pos = 0;
		for (Object o : actualDeliveryList)
			todayContent[pos++] = o;
		for (Object o : reviewListArr)
			todayContent[pos++] = o;
		for (Object o : driverList)
			todayContent[pos++] = o;
		for (Object o : reportListArr)
			todayContent[pos++] = o;

		String[] keys = { "mountainous", "caution", "actualFee", "reviewId", "rating", "reason", "driverName",
				"carName", "reportId" };

		for (int i = 0; i < todayContent.length; i++) {
			if (todayContent[i] != null) {
				map.put(keys[i], todayContent[i]);
			} else {
				map.put(keys[i], null);
			}
		}

		return map;
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

		boolean hasConflict = deliveryAssignmentRepository.existsOverlappingByRequestWindow(driver.getDriverId(), start,
				end, blocking);
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
		var heads = deliveryAssignmentRepository.findCurrentTrackingHead(driverId, now, PageRequest.of(0, 1));
		if (heads.isEmpty())
			return null;

		var h = heads.get(0);
		Long requestId = h.getRequestId();

		// 1) 웨이포인트 전체(START~DEST)
		var points = deliveryWaypointRepository.findAllByRequestIdOrderByDrop(requestId);

		// 2) 화물 맵 (waypointId -> cargos)
		var cargoRows = cargoRepository.findCargoOnePerWaypoint(requestId);
		Map<Long, DeliveryCargoSlimResponseDTO> cargoByWp = cargoRows.stream()
				.collect(Collectors.toMap(DeliveryCargoSlimResponseDTO::getWaypointId, Function.identity()));

		// 3) 최신 상태
		var last = deliveryStatusLogRepository
				.findByDeliveryAssignment_DeliveryRequest_RequestIdOrderByCreatedAtDescStatusIdDesc(requestId,
						PageRequest.of(0, 1));
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
	public DeliveryAssignmentTrackingDTO applyAction(Long assignedId, DriverActionEnum action) {
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
			// last == null 만 허용
			if (last != null)
				throw new IllegalStateException("이미 시작됨");
			insertLog(assignment, DeliveryStatusEnum.MOVING_TO_PICKUP, 0, now);

			dummyTracker.startToPickup(assignment.getDriver().getDriverId().toString(), assignedId,
					points.get(0).getAddress());
		}
		case PICKUP_COMPLETED -> {
			// MOVING_TO_PICKUP 상태에서만
			require(status == DeliveryStatusEnum.MOVING_TO_PICKUP, "집하 이동 중이 아님");
			insertLog(assignment, DeliveryStatusEnum.PICKUP_COMPLETED, 0, now);
			insertLog(assignment, DeliveryStatusEnum.MOVING_TO_WAYPOINT, 0, now.plusNanos(1));

			// Dummy 이동: 0 -> 1 (있다면)
			if (points.size() > 1) {
				dummyTracker.prepareLeg(assignment.getDriver().getDriverId().toString(), assignedId,
						points.get(0).getAddress(), points.get(1).getAddress(), true // auto 주행
				);
			}
		}
		case ARRIVED_AT_WAYPOINT -> {
			// MOVING_TO_WAYPOINT 에서만.
			require(status == DeliveryStatusEnum.MOVING_TO_WAYPOINT, "경유지 이동 중이 아님");
			int arriveIdx = lastVisited + 1;
			require(arriveIdx >= 1 && arriveIdx < points.size(), "도착 인덱스 범위 오류");
			insertLog(assignment, DeliveryStatusEnum.ARRIVED_AT_WAYPOINT, arriveIdx, now);
			dummyTracker.arriveNow(assignment.getDriver().getDriverId().toString());
		}
		case DROPPED_AT_WAYPOINT -> {
			// ARRIVED_AT_WAYPOINT 에서만.
			require(status == DeliveryStatusEnum.ARRIVED_AT_WAYPOINT, "경유지 도착 상태가 아님");
			int k = lastVisited; // 도착해 둔 인덱스
			require(k >= 1 && k < points.size(), "하차 인덱스 범위 오류");
			insertLog(assignment, DeliveryStatusEnum.DROPPED_AT_WAYPOINT, k, now);
			// 다음 이동 상태로 전환: 다음 목표는 k+1 (존재할 때)
			if (k + 1 < points.size()) {
				insertLog(assignment, DeliveryStatusEnum.MOVING_TO_WAYPOINT, k, now.plusNanos(1));
				// lastVisited는 "마지막 방문 완료 지점"을 의미하므로 그대로 k 유지가 자연스럽습니다.

				// 다음 구간은 k -> k+1 이어야 함 (from != to) ✅
				dummyTracker.prepareLeg(assignment.getDriver().getDriverId().toString(), assignedId,
						points.get(k).getAddress(), // from
						points.get(k + 1).getAddress(), // to ✅
						true);
			} else {
				// 더 이상 경유지 없다면 COMPLETE로 넘어가게 하거나, 대기 상태 처리
				// (비즈니스 규칙에 맞게)
			}
		}
		case COMPLETE -> {
			// 마지막 구간은 points.size()-1 이 도착지(DEST).
			int lastIdx = points.size() - 1;
			require((status == DeliveryStatusEnum.ARRIVED_AT_WAYPOINT
					|| status == DeliveryStatusEnum.DROPPED_AT_WAYPOINT) && lastVisited == lastIdx, "완료 가능한 상태/위치가 아님");
			insertLog(assignment, DeliveryStatusEnum.COMPLETED, lastVisited, now);
			completeAssignment(assignment, now);
			dummyTracker.setMode(assignment.getDriver().getDriverId().toString(), DummyDriver.Mode.MANUAL);
		}
		case PAUSE -> {
			insertLog(assignment, DeliveryStatusEnum.ON_HOLD, Math.max(lastVisited, 0), now);
			dummyTracker.setMode(assignment.getDriver().getDriverId().toString(), DummyDriver.Mode.MANUAL);

		}
		// 다음 경유지 건너뛰기
		case SKIPPED_WAYPOINT -> {
			require(status == DeliveryStatusEnum.MOVING_TO_WAYPOINT, "경유지 이동 중이 아님");

			// 건너뛸 인덱스: 마지막 방문/완료 인덱스 + 1
			int skipIdx = lastVisited + 1;
			// DEST를 스킵하면 운송 애매해지므로 막음.
			require(skipIdx >= 1 && (skipIdx + 1) < points.size(), "마지막 경유지는 건너뛸 수 없음");

			insertLog(assignment, DeliveryStatusEnum.MOVING_TO_WAYPOINT, skipIdx, now.plusNanos(1));

			// 더미 드라이버도 즉시 전환.
			dummyTracker.prepareLeg(assignment.getDriver().getDriverId().toString(), assignedId,
					points.get(skipIdx).getAddress(), points.get(skipIdx + 1).getAddress(), true);
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

	// 운송 완료 처리
	@Transactional
	private void completeAssignment(DeliveryAssignment a, LocalDateTime now) {
		if(a == null) {
			return;
		}

		// 이미 완료면 무시
		if (a.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED)
			return;

		// 허용 상태 검사
		if (a.getStatus() != com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.IN_PROGRESS
				&& a.getStatus() != com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED) {
			// 필요하면 예외
			throw new IllegalStateException("Not completable state: " + a.getStatus());
		}

		// 1) 실주행 경로 요약 만들기 (+ 원본 로그 삭제)
		var summary = trackingLogService.extractActualRoute(a.getAssignedId(), true);
		Long weight = (long) a.getDeliveryRequest().getTotalCargoWeight();

		// 2) ActualDelivery 생성/저장 → 즉시 할당
		ActualDelivery ad = ActualDelivery.builder()
				.distance(summary.getDistance())
				.actualPolyline(summary.getEncodedPolyline())
				.weight(weight)
				.mountainous(false)
				.caution(false).build();
		ad = actualDeliveryRepository.save(ad);
		a.setActualDelivery(ad);

		// 3) Payment 생성/저장 → 즉시 할당
		Payment p = Payment.builder().payStatus(PayStatusEnum.PENDING).settlement(false)
				// .payAmount(a.getDeliveryRequest().getEstimatedFee()) // 금액 연결하려면 이렇게
				.build();
		p = paymentRepository.save(p);
		a.setPayment(p);

		// 4) 상태/완료시각 업데이트
		a.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.COMPLETED);
		a.setCompletedAt(now);
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

}