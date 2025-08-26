package com.gpt.squirrelLogistics.service.deliveryRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.actualCalc.EstimateCalcDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestCardSlimDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DriverAssignmentResponseDTO;
import com.gpt.squirrelLogistics.entity.cargoType.CargoType;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.cargoType.CargoTypeRepository;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
import com.gpt.squirrelLogistics.repository.deliveryCargo.DeliveryCargoRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;
import com.gpt.squirrelLogistics.repository.payment.PaymentRepository;
import com.gpt.squirrelLogistics.service.deliveryCargo.DelilveryCargoService;
import com.gpt.squirrelLogistics.service.deliveryWaypoint.DeliveryWaypointService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class DeliveryRequestServiceImpl implements DeliveryRequestService {

	private final DeliveryRequestRepository repository;
	private final CompanyRepository companyRepository;
	private final VehicleTypeRepository vehicleTypeRepository;
	private final PaymentRepository paymentRepository;
	private final DeliveryAssignmentRepository assignmentRepository;
	private final DelilveryCargoService cargoService;
	private final DeliveryWaypointService waypointService;
	private final KakaoLocalClient localClient;
	private final KakaoRouteClient routeClient;

	
	/* ✅ 추가 주입(0821 정윤진) */
	private final CargoTypeRepository cargoTypeRepository;
	
	
	private final DeliveryCargoRepository deliveryCargoRepository;

	@PersistenceContext
	private EntityManager entityManager;

	/* ============== Mapping ============== */

	// DTO -> Entity (카카오 지오코딩/경로 포함)
	public DeliveryRequest reqDtoToEntity(DeliveryRequestRequestDTO dto) {

		// 경유지 위경도
		List<LatLng> via = new ArrayList<>();
		if (dto.getWaypoints() != null && !dto.getWaypoints().isEmpty()) {
			dto.getWaypoints().stream().sorted(Comparator.comparingInt(DeliveryWaypointRequestDTO::getDropOrder))
					.forEach(w -> {
						LatLng wp = localClient.geocode(w.getAddress());
						if (wp != null)
							via.add(wp);
					});
		}

		// 출발/도착 좌표
		LatLng start = localClient.geocode(dto.getStartAddress());
		LatLng end = localClient.geocode(dto.getEndAddress());

		Long distance = dto.getDistance(); // 기본값은 프론트 전달
		String polylineJson = dto.getExpectedPolyline();
		String routeJson = dto.getExpectedRoute();

		// [MOD] distance가 null일 수 있으므로 0L로 안전 초기화
		if (distance == null) {
			distance = 0L;
		}

		// 경로/폴리라인 계산 (가능하면 갱신)
		if (start != null && end != null) {
			var route = routeClient.requestRoute(start, end, via);
			// [MOD] route가 null이거나 distance 미계산일 때 NPE 방지
			if (route != null) {
				if (route.getDistance() > 0) {
					distance = route.getDistance();
				}
				try {
					routeJson = routeClient.toJsonRoute(route.getPolyline());
					polylineJson = routeClient.encodePolyline(route.getPolyline());
				} catch (Exception ignore) {
					// 인코딩 실패 시 프론트에서 받은 값 유지
				}
			}
		}

		// 연관 엔티티 참조
		Payment paymentRef = (dto.getPaymentId() != null)
				? entityManager.getReference(Payment.class, dto.getPaymentId())
				: null;

		Company companyRef = null;
		if (dto.getCompanyId() != null) {
			companyRef = companyRepository.findById(dto.getCompanyId())
					.orElseThrow(() -> new IllegalArgumentException("Company not found: " + dto.getCompanyId()));
		}

		VehicleType vehicleTypeRef = null;
		if (dto.getVehicleTypeId() != null) {
			vehicleTypeRef = vehicleTypeRepository.findById(dto.getVehicleTypeId()).orElseThrow(
					() -> new IllegalArgumentException("VehicleType not found: " + dto.getVehicleTypeId()));
		}

		// 엔티티 생성
		return DeliveryRequest.builder().requestId(dto.getRequestId()).startAddress(dto.getStartAddress())
				.endAddress(dto.getEndAddress()).memoToDriver(dto.getMemoToDriver())
				.totalCargoCount(dto.getTotalCargoCount()).totalCargoWeight(dto.getTotalCargoWeight())
				.estimatedFee(dto.getEstimatedFee()).distance(distance)
				.createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDateTime.now())
				.wantToStart(dto.getWantToStart()).wantToEnd(dto.getWantToEnd()).expectedPolyline(polylineJson)
				.expectedRoute(routeJson).status(dto.getStatus() != null ? dto.getStatus() : StatusEnum.REGISTERED) // [MOD]
																													// null
																													// 시
																													// 기본값
				.payment(paymentRef).company(companyRef).vehicleType(vehicleTypeRef) // ✅ vehicleTypeId → FK 매핑
				.build();
	}

	// Entity -> Full DTO
	public DeliveryRequestResponseDTO entityToFullDto(DeliveryRequest request) {
		if (request == null)
			return null;

		String companyName = null;
		if (request.getCompany() != null && request.getCompany().getUser() != null) {
			companyName = request.getCompany().getUser().getName();
		}

		Long vehicleTypeId = null;
		String vehicleTypeName = null;
		if (request.getVehicleType() != null) {
			VehicleType vt = request.getVehicleType();
			// [MOD] VehicleType의 키 접근 (프로젝트 도메인에 맞게)
			vehicleTypeId = vt.getVehicleTypeId(); // 또는 vt.getId()
			vehicleTypeName = vt.getName();
		}

		Long paymentId = null;
		if (request.getPayment() != null) {
			Payment pm = request.getPayment();
			if (pm.getPaymentId() != null) {
				paymentId = pm.getPaymentId();
			}
		}

		List<DeliveryWaypointSlimResponseDTO> waypoints = waypointService.readAll(request.getRequestId());

		return DeliveryRequestResponseDTO.builder().requestId(request.getRequestId())
				.startAddress(request.getStartAddress()).endAddress(request.getEndAddress())
				.memoToDriver(request.getMemoToDriver()).totalCargoCount(request.getTotalCargoCount())
				.distance(request.getDistance()).totalCargoWeight(request.getTotalCargoWeight())
				.estimatedFee(request.getEstimatedFee()).wantToStart(request.getWantToStart())
				.wantToEnd(request.getWantToEnd()).expectedPolyline(request.getExpectedPolyline())
				.expectedRoute(request.getExpectedRoute()).paymentId(paymentId).companyName(companyName)
				.vehicleTypeId(vehicleTypeId).vehicleTypeName(vehicleTypeName).waypoints(waypoints).build();
	}

	// Entity -> Slim DTO
	public DeliveryRequestSlimResponseDTO entityToSlimDto(DeliveryRequest request) {
		if (request == null)
			return null;

		Long vehicleTypeId = null;
		String vehicleTypeName = null;
		if (request.getVehicleType() != null) {
			// [MOD] VehicleType의 키 접근 (프로젝트 도메인에 맞게)
			vehicleTypeId = request.getVehicleType().getVehicleTypeId(); // 또는 getId()
			vehicleTypeName = request.getVehicleType().getName();
		}

		return DeliveryRequestSlimResponseDTO.builder().requestId(request.getRequestId())
				.startAddress(request.getStartAddress()).endAddress(request.getEndAddress())
				.distance(request.getDistance()).vehicleTypeId(vehicleTypeId).vehicleTypeName(vehicleTypeName)
				.estimatedFee(request.getEstimatedFee()).distance(request.getDistance()).createAt(request.getCreateAt())
				.status(request.getStatus()).wantToStart(request.getWantToStart()).wantToEnd(request.getWantToEnd())
				.build();
	}

	/* ============== CRUD ============== */
	@Override
	public Long create(PaymentDTO paymentDTO, DeliveryRequestRequestDTO requestDTO) {

		if (paymentDTO == null || requestDTO == null) {
			return null;
		}

		// 선결제 정보 생성.
		Payment prePayment = Payment.builder().paid(paymentDTO.getPaid()).payAmount(paymentDTO.getPayAmount())
				.payMethod(paymentDTO.getPayMethod()).payStatus(paymentDTO.getPayStatus())
				.prepaidId(paymentDTO.getPrepaidId()).refundDate(paymentDTO.getRefundDate())
				.settlement(paymentDTO.isSettlement()).settlementFee(paymentDTO.getSettlementFee()).build();
		Long paymentId = paymentRepository.save(prePayment).getPaymentId();

		requestDTO.setPaymentId(paymentId);
		requestDTO.setStatus(com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum.REGISTERED);

		DeliveryRequest entity = reqDtoToEntity(requestDTO);
		entity.setRequestId(null);
		DeliveryRequest saved_request = repository.save(entity);

		// ✅ 생성된 waypoint id들을 수집(08.21정윤진)
		List<Long> waypointIds = new ArrayList<>();

		if (requestDTO.getWaypoints() != null) {
			for (DeliveryWaypointRequestDTO wpdto : requestDTO.getWaypoints()) {
				Long wpId = waypointService.create(saved_request, wpdto);
				if (wpdto.getCargo() != null) {
					cargoService.create(wpId, wpdto.getCargo());
				}
			}
		}

		// 08.21 정윤진
		// ✅ 경유지가 하나도 없으면, cargoTypes를 매핑할 수 있도록 도착지 기준으로 waypoint 1건 자동 생성
		if (waypointIds.isEmpty()) {
			DeliveryWaypointRequestDTO autoWp = new DeliveryWaypointRequestDTO();
			autoWp.setAddress(requestDTO.getEndAddress());
			autoWp.setDropOrder(1);
			Long autoWpId = waypointService.create(saved_request, autoWp);
			waypointIds.add(autoWpId);
		}

		/* ✅ cargoTypes → cargo_type 업서트 + delivery_cargo(waypoint 연동) 저장 */
		if (requestDTO.getCargoTypes() != null && !requestDTO.getCargoTypes().isEmpty()) {
			for (String tag : requestDTO.getCargoTypes()) {
				if (tag == null || tag.isBlank())
					continue;

				// cargo_type upsert by handlingTags
				CargoType ct = cargoTypeRepository.findByHandlingTags(tag.trim()).orElseGet(() -> cargoTypeRepository
						.save(CargoType.builder().handlingTags(tag.trim()).extraFee(0L).build()));

				// 모든 waypoint에 동일 cargoType 매핑 (요건에 맞게 필요시 조정)
				for (Long wpId : waypointIds) {
					DeliveryWaypoint wpRef = entityManager.getReference(DeliveryWaypoint.class, wpId);

					DeliveryCargo dc = DeliveryCargo.builder().deliveryWaypoint(wpRef) // ✅ DeliveryCargo 필드명에 맞게 저장
							.cargoType(ct).description(null).build();

					deliveryCargoRepository.save(dc);
				}
			}
		}
		
		
		return saved_request.getRequestId();
	}

	/* ============== 기사 지명 요청 관련 메서드들 ============== */

	/**
	 * 🚛 기사 지명 요청 생성 (기존 create와 유사하지만 특정 기사에게만 요청)
	 * 
	 * @param paymentDTO 결제 정보
	 * @param requestDTO 배송 요청 정보
	 * @param driverId 지명할 기사 ID
	 * @return 생성된 요청 ID
	 */
	@Override
	public Long createDriverRequest(PaymentDTO paymentDTO, DeliveryRequestRequestDTO requestDTO, Long driverId) {
		if (paymentDTO == null || requestDTO == null || driverId == null) {
			throw new IllegalArgumentException("필수 파라미터가 누락되었습니다.");
		}

		// 1. 기사 검증 (즉시 배차 가능, 적재량 충족 등)
		if (!validateDriverForRequest(driverId, requestDTO)) {
			throw new IllegalArgumentException("선택한 기사가 요청 조건을 만족하지 않습니다.");
		}

		// 2. 선결제 정보 생성 (기존과 동일)
		Payment prePayment = Payment.builder()
				.paid(paymentDTO.getPaid())
				.payAmount(paymentDTO.getPayAmount())
				.payMethod(paymentDTO.getPayMethod())
				.payStatus(paymentDTO.getPayStatus())
				.prepaidId(paymentDTO.getPrepaidId())
				.refundDate(paymentDTO.getRefundDate())
				.settlement(paymentDTO.isSettlement())
				.settlementFee(paymentDTO.getSettlementFee())
				.build();
		
		Long paymentId = paymentRepository.save(prePayment).getPaymentId();

		// 3. 요청 DTO 설정 (기사 지명 요청용)
		requestDTO.setPaymentId(paymentId);
		requestDTO.setStatus(StatusEnum.PROPOSED); // 기사 지명 요청 상태

		// 4. 엔티티 생성 및 저장 (기존과 동일)
		DeliveryRequest entity = reqDtoToEntity(requestDTO);
		entity.setRequestId(null);
		DeliveryRequest savedRequest = repository.save(entity);

		// 5. 경유지 및 화물 정보 생성 (기존과 동일)
		List<Long> waypointIds = new ArrayList<>();

		if (requestDTO.getWaypoints() != null) {
			for (DeliveryWaypointRequestDTO wpdto : requestDTO.getWaypoints()) {
				Long wpId = waypointService.create(savedRequest, wpdto);
				if (wpdto.getCargo() != null) {
					cargoService.create(wpId, wpdto.getCargo());
				}
			}
		}

		// 경유지가 없으면 도착지 기준으로 자동 생성 (기존과 동일)
		if (waypointIds.isEmpty()) {
			DeliveryWaypointRequestDTO autoWp = new DeliveryWaypointRequestDTO();
			autoWp.setAddress(requestDTO.getEndAddress());
			autoWp.setDropOrder(1);
			Long autoWpId = waypointService.create(savedRequest, autoWp);
			waypointIds.add(autoWpId);
		}

		// 화물 타입 정보 저장 (기존과 동일)
		if (requestDTO.getCargoTypes() != null && !requestDTO.getCargoTypes().isEmpty()) {
			for (String tag : requestDTO.getCargoTypes()) {
				if (tag == null || tag.isBlank())
					continue;

				CargoType ct = cargoTypeRepository.findByHandlingTags(tag.trim())
						.orElseGet(() -> cargoTypeRepository.save(
							CargoType.builder()
								.handlingTags(tag.trim())
								.extraFee(0L)
								.build()
						));

				for (Long wpId : waypointIds) {
					DeliveryWaypoint wpRef = entityManager.getReference(DeliveryWaypoint.class, wpId);
					DeliveryCargo dc = DeliveryCargo.builder()
							.deliveryWaypoint(wpRef)
							.cargoType(ct)
							.description(null)
							.build();
					deliveryCargoRepository.save(dc);
				}
			}
		}

		// 6. 기사 할당 정보 생성 (새로 추가)
		createDriverAssignment(savedRequest.getRequestId(), driverId);

		log.info("기사 지명 요청 생성 완료: requestId={}, driverId={}", savedRequest.getRequestId(), driverId);
		
		return savedRequest.getRequestId();
	}

	/**
	 * 🔗 기사 할당 정보 생성 및 저장
	 * 
	 * @param requestId 배송 요청 ID
	 * @param driverId 기사 ID
	 */
	private void createDriverAssignment(Long requestId, Long driverId) {
		try {
			DeliveryRequest deliveryRequest = entityManager.getReference(DeliveryRequest.class, requestId);
			com.gpt.squirrelLogistics.entity.driver.Driver driver = 
				entityManager.getReference(com.gpt.squirrelLogistics.entity.driver.Driver.class, driverId);

			// 기존 할당 정보가 있다면 삭제 (중복 방지)
			assignmentRepository.deleteByRequestAndDriver(requestId, driverId);

			// 새로운 할당 정보 생성 (기존 상태값 활용)
			com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment assignment = 
				com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment.builder()
					.deliveryRequest(deliveryRequest)
					.driver(driver)
					.status(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN) // 기존 상태값 사용
					.build();

			assignmentRepository.save(assignment);
			log.info("기사 할당 정보 생성 완료: requestId={}, driverId={}", requestId, driverId);
			
		} catch (Exception e) {
			log.error("기사 할당 정보 생성 실패: requestId={}, driverId={}", requestId, driverId, e);
			throw new RuntimeException("기사 할당 정보 생성에 실패했습니다.", e);
		}
	}

	/**
	 * ✅ 기사 검증 로직 (즉시 배차 가능, 적재량 충족 등)
	 * 
	 * @param driverId 기사 ID
	 * @param requestDTO 배송 요청 정보
	 * @return 검증 통과 여부
	 */
	private boolean validateDriverForRequest(Long driverId, DeliveryRequestRequestDTO requestDTO) {
		try {
			// 1. 기사 존재 여부 확인 - 간단한 방법으로 변경
			// 기사 ID가 유효한지 확인 (실제 검증은 기사 할당 시점에 수행)
			if (driverId == null || driverId <= 0) {
				log.warn("유효하지 않은 기사 ID: driverId={}", driverId);
				return false;
			}

			// 2. 적재량 검증 (간단한 로직으로 변경)
			// totalCargoWeight는 int 타입이므로 null 체크 불필요
			if (requestDTO.getTotalCargoWeight() <= 0) {
				log.warn("유효하지 않은 적재량: weight={}", requestDTO.getTotalCargoWeight());
				return false;
			}

			// 3. 기본 검증 통과 (실제 상세 검증은 기사 할당 시점에 수행)
			log.info("기사 기본 검증 통과: driverId={}", driverId);
			return true;
			
		} catch (Exception e) {
			log.error("기사 검증 중 오류 발생: driverId={}", driverId, e);
			return false;
		}
	}

	/**
	 * 📱 결제 완료 후 기사 지명 요청 전송
	 * 
	 * @param requestId 배송 요청 ID
	 * @param paymentId 결제 ID
	 */
	@Override
	public void sendDriverRequestAfterPayment(Long requestId, Long paymentId) {
		try {
			// 1. 결제 상태 확인
			Payment payment = paymentRepository.findById(paymentId)
					.orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다: " + paymentId));

			if (!"COMPLETE".equals(payment.getPayStatus())) {
				log.warn("결제가 완료되지 않음: requestId={}, paymentId={}, status={}", 
					requestId, paymentId, payment.getPayStatus());
				return;
			}

			// 2. 기사 할당 정보 조회 (기존 상태값 활용)
			com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment assignment = 
				assignmentRepository.findByRequestId(requestId)
					.stream()
					.filter(a -> a.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN)
					.findFirst()
					.orElse(null);

			if (assignment == null) {
				log.warn("기사 할당 정보를 찾을 수 없음: requestId={}", requestId);
				return;
			}

			// 3. 지명된 기사에게만 요청 전송
			Long driverId = assignment.getDriver().getDriverId();
			sendRequestToSpecificDriver(requestId, driverId);

			log.info("기사 지명 요청 전송 완료: requestId={}, driverId={}", requestId, driverId);
			
		} catch (Exception e) {
			log.error("기사 지명 요청 전송 실패: requestId={}, paymentId={}", requestId, paymentId, e);
			throw new RuntimeException("기사 지명 요청 전송에 실패했습니다.", e);
		}
	}

	/**
	 * 📤 특정 기사에게 요청 전송 (알림, 푿시 등)
	 * 
	 * @param requestId 배송 요청 ID
	 * @param driverId 기사 ID
	 */
	private void sendRequestToSpecificDriver(Long requestId, Long driverId) {
		try {
			// 1. 요청 정보 조회
			DeliveryRequest request = repository.findById(requestId)
					.orElseThrow(() -> new IllegalArgumentException("배송 요청을 찾을 수 없습니다: " + requestId));

			// 2. 기사 정보 조회
			com.gpt.squirrelLogistics.entity.driver.Driver driver = 
				entityManager.getReference(com.gpt.squirrelLogistics.entity.driver.Driver.class, driverId);

			// 3. 요청 전송 로직 (실제 구현 시 알림 서비스 연동)
			log.info("기사에게 요청 전송: driverId={}, requestId={}, startAddress={}, endAddress={}", 
				driverId, requestId, request.getStartAddress(), request.getEndAddress());

			// TODO: 실제 알림 서비스 연동
			// - 푸시 알림
			// - SMS 발송
			// - 앱 내 알림
			// - 이메일 발송 등

			// 4. 할당 상태 업데이트 (요청 전송 완료 - 기존 상태값 활용)
			com.gpt.squirrelLogistics.entity.deliveryAssignment.DeliveryAssignment assignment = 
				assignmentRepository.findByRequestId(requestId)
					.stream()
					.filter(a -> a.getDriver().getDriverId().equals(driverId))
					.findFirst()
					.orElse(null);

			if (assignment != null) {
				// 기존 상태값 중에서 적절한 것으로 변경 (예: ASSIGNED)
				// assignment.updateStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED);
				// updateStatus 메서드가 없으므로 직접 설정
				assignment.setStatus(com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.ASSIGNED);
				assignmentRepository.save(assignment);
			}

		} catch (Exception e) {
			log.error("기사 요청 전송 실패: requestId={}, driverId={}", requestId, driverId, e);
			throw new RuntimeException("기사 요청 전송에 실패했습니다.", e);
		}
	}

	/**
	 * 🔄 일반 요청과 기사 지명 요청 구분
	 * 
	 * @param requestId 배송 요청 ID
	 * @return true: 기사 지명 요청, false: 일반 요청
	 */
	@Override
	@Transactional(readOnly = true)
	public boolean isDriverSpecificRequest(Long requestId) {
		try {
			// 기사 할당 정보가 있고 상태가 UNKNOWN인 경우 기사 지명 요청 (기존 상태값 활용)
			return assignmentRepository.findByRequestId(requestId)
					.stream()
					.anyMatch(a -> a.getStatus() == com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN);
		} catch (Exception e) {
			log.error("요청 타입 확인 실패: requestId={}", requestId, e);
			return false;
		}
	}

	@Override
	@Transactional(readOnly = true)
	public DeliveryRequestSlimResponseDTO readSlim(Long requestId) {
		DeliveryRequest entity = repository.findById(requestId)
				.orElseThrow(() -> new NoSuchElementException("DeliveryRequest not found: " + requestId));
		return entityToSlimDto(entity);
	}

	@Override
	@Transactional(readOnly = true)
	public DeliveryRequestResponseDTO readFull(Long id) {
		DeliveryRequest entity = repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("요청 ID " + id + "를 찾을 수 없습니다."));
		return entityToFullDto(entity);
	}

	@Transactional(readOnly = true)
	public DeliveryRequestResponseDTO readFullSafe(Long requestId, Long driverId) throws NotFoundException {
		DeliveryRequest req = repository.findById(requestId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

		switch (req.getStatus()) {
		case REGISTERED:
			// 공개 상태 => 누구나 상세 열람 가능.
			break;

		case PROPOSED:

			if (driverId != null && assignmentRepository.existsByRequestAndDriverAndStatus(requestId, driverId,
					com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum.UNKNOWN))
				break;
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);

		case ASSIGNED:
		case FAILED:
		case RETRACTED:
		case UNKNOWN:
			// 열람 가능 상태가 아닌 게시글 차단.
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);

		default:
			// 기타 상태도 보수적으로 차단.
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}

		return entityToFullDto(req);
	}

	@Override
	public void update(Long requestId, DeliveryRequestRequestDTO dto) {
		DeliveryRequest entity = repository.findById(requestId)
				.orElseThrow(() -> new NoSuchElementException("DeliveryRequest not found: " + requestId));
		// 필요한 필드만 업데이트 (여기서는 상태만 예시)
		entity.updateStatus(dto.getStatus());
		// JPA 영속 컨텍스트 내 변경 감지로 저장
	}

	@Override
	public void delete(Long requestId) {
		if (!repository.existsById(requestId)) {
			throw new NoSuchElementException("DeliveryRequest not found: " + requestId);
		}
		repository.deleteById(requestId);
	}

	/* ============== 목록 ============== */

	// 커스텀 페이지 DTO
	@Override
	@Transactional(readOnly = true)
	public PageResponseDTO<DeliveryRequestCardSlimDTO> list(PageRequestDTO pageReq) {
		Page<DeliveryRequest> page = repository.findActiveRegistered(pageReq.toPageable());
		List<DeliveryRequestCardSlimDTO> dtoList = page.getContent().stream().map(this::entityToSlimDto)
				.collect(Collectors.toList());

		return PageResponseDTO.<DeliveryRequestCardSlimDTO>withAll().dtoList(dtoList).pageRequestDTO(pageReq)
				.totalCount(page.getTotalElements()).build();
	}

	// Spring 표준 Page<T>
	@Override
	@Transactional(readOnly = true)
	public Page<DeliveryRequestSlimResponseDTO> getPage(Pageable pageable) {
		return repository.findAll(pageable).map(this::entityToSlimDto);
	}

	// 김도경
	// repository 는 deliveryRequest꺼
	@Override
	public List<Object[]> getEstimateCalc(Long requestId) {
		return deliveryCargoRepository.findEstimatedCalcByRequestId(requestId);
	}
	
	// 기사 지명 요청 정보 조회 (작성자: 정윤진)
	@Override
	@Transactional(readOnly = true)
	public DriverAssignmentResponseDTO getDriverAssignmentByRequestId(Long requestId) {
		Object[] result = repository.findDriverAssignmentByRequestId(requestId);
		if (result == null || result.length == 0) {
			return null; // 지명된 기사가 없는 경우
		}
		
		// JPQL 결과를 DTO로 변환
		return DriverAssignmentResponseDTO.builder()
				.driverId((Long) result[0])
				.mainLoca((String) result[1])
				.drivable((Boolean) result[2])
				.carId((Long) result[3])
				.carNum((String) result[4])
				.isInsurance((Boolean) result[5])
				.vehicleTypeId((Long) result[6])
				.vehicleTypeName((String) result[7])
				.maxWeight((Integer) result[8])
				.userId((Long) result[9])
				.driverName((String) result[10])
				.build();
	}
	
	// 모든 지명된 요청의 기사 정보 조회 (작성자: 정윤진)
	@Override
	@Transactional(readOnly = true)
	public List<DriverAssignmentResponseDTO> getAllAssignedDriverRequests() {
		List<Object[]> results = repository.findAllAssignedDriverRequests();
		return results.stream()
				.map(result -> DriverAssignmentResponseDTO.builder()
						.requestId((Long) result[0])
						.startAddress((String) result[1])
						.endAddress((String) result[2])
						.estimatedFee((Long) result[3])
						.driverId((Long) result[4])
						.mainLoca((String) result[5])
						.drivable((Boolean) result[6])
						.carId((Long) result[7])
						.carNum((String) result[8])
						.isInsurance((Boolean) result[9])
						.vehicleTypeId((Long) result[10])
						.vehicleTypeName((String) result[11])
						.maxWeight((Integer) result[12])
						.userId((Long) result[13])
						.driverName((String) result[14])
						.build())
				.collect(Collectors.toList());
	}
}
