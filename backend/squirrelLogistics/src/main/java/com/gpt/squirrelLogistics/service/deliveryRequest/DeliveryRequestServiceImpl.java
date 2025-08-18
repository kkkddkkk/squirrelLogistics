package com.gpt.squirrelLogistics.service.deliveryRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.deliveryAssignment.DeliveryAssignmentRepository;
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

		if (requestDTO.getWaypoints() != null) {
			for (DeliveryWaypointRequestDTO wpdto : requestDTO.getWaypoints()) {
				Long wpId = waypointService.create(saved_request, wpdto);
				if (wpdto.getCargo() != null) {
					cargoService.create(wpId, wpdto.getCargo());
				}
			}
		}

		return saved_request.getRequestId();
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
		DeliveryRequest req = repository.findById(requestId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));


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
			//열람 가능 상태가 아닌 게시글 차단.
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
	public PageResponseDTO<DeliveryRequestSlimResponseDTO> list(PageRequestDTO pageReq) {
        Page<DeliveryRequest> page = repository.findActiveRegistered(pageReq.toPageable());
		List<DeliveryRequestSlimResponseDTO> dtoList = page.getContent().stream().map(this::entityToSlimDto)
				.collect(Collectors.toList());

		return PageResponseDTO.<DeliveryRequestSlimResponseDTO>withAll().dtoList(dtoList).pageRequestDTO(pageReq)
				.totalCount(page.getTotalElements()).build();
	}

	// Spring 표준 Page<T>
	@Override
	@Transactional(readOnly = true)
	public Page<DeliveryRequestSlimResponseDTO> getPage(Pageable pageable) {
		return repository.findAll(pageable).map(this::entityToSlimDto);
	}
}
