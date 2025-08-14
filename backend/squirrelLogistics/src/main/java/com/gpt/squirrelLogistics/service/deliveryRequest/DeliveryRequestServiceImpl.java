package com.gpt.squirrelLogistics.service.deliveryRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.dto.page.PageRequestDTO;
import com.gpt.squirrelLogistics.dto.page.PageResponseDTO;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.payment.Payment;
import com.gpt.squirrelLogistics.entity.vehicleType.VehicleType;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoRouteClient;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
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
	private final DeliveryWaypointService waypointService;
	private final KakaoLocalClient localClient;
	private final KakaoRouteClient routeClient;

	@PersistenceContext
	private EntityManager entityManager;

	public DeliveryRequest reqDtoToEntity(DeliveryRequestRequestDTO dto) {

		// 경유지 위-경도 추출.
		List<LatLng> via = new ArrayList<>();

		if (dto.getWaypoints() != null && !dto.getWaypoints().isEmpty()) {
			dto.getWaypoints().stream().sorted(Comparator.comparingInt(DeliveryWaypointRequestDTO::getDropOrder))
					.forEach(w -> {
						LatLng wp = localClient.geocode(w.getAddress());
						if (wp != null) {
							via.add(wp);
						}
					});
		}

		// 위치 좌표로 추출.
		LatLng start = localClient.geocode(dto.getStartAddress());
		LatLng end = localClient.geocode(dto.getEndAddress());

		Long distance = null;
		String polylineJson = null;
		String routeJson = null;

		// 경로 및 폴리라인 정보 저장.
		if (start != null && end != null) {
			var route = routeClient.requestRoute(start, end, via);
			distance = route.getDistance();
			routeJson = routeClient.toJsonRoute(route.getPolyline());
			polylineJson = routeClient.encodePolyline(route.getPolyline());
		}

		// 연계 참조관계 주입.
		Payment paymentRef = (dto.getPaymentId() != null)
				? entityManager.getReference(Payment.class, dto.getPaymentId())
				: null;
		Company companyRef = (dto.getCompanyId() != null)
				? entityManager.getReference(Company.class, dto.getCompanyId())
				: null;
		VehicleType vehicleTypeRef = (dto.getVehicleTypeId() != null)
				? entityManager.getReference(VehicleType.class, dto.getVehicleTypeId())
				: null;

		// 엔티티 개체 생성.
		return DeliveryRequest.builder().requestId(dto.getRequestId()).startAddress(dto.getStartAddress())
				.endAddress(dto.getEndAddress()).memoToDriver(dto.getMemoToDriver())
				.totalCargoCount(dto.getTotalCargoCount()).totalCargoWeight(dto.getTotalCargoWeight())
				.estimatedFee(dto.getEstimatedFee())
				.distance(distance != null ? distance.longValue() : dto.getDistance())
				.createAt(dto.getCreateAt() != null ? dto.getCreateAt() : LocalDateTime.now())
				.wantToStart(dto.getWantToStart()).wantToEnd(dto.getWantToEnd()).expectedPolyline(polylineJson)
				.expectedRoute(routeJson).status(dto.getStatus()).payment(paymentRef).company(companyRef)
				.vehicleType(vehicleTypeRef).build();
	}

	// 개별 요청 정보 상세 보기.
	public DeliveryRequestResponseDTO entityToFullDto(DeliveryRequest request) {

		if (request == null) {
			return null;
		}

		String companyName = null;
		if (request.getCompany() != null) {
			Company company = request.getCompany();

			if (company.getUser() != null && company.getUser().getName() != null) {
				companyName = company.getUser().getName();
			}
		}

		Long vehicleTypeId = null;
		String vehicleTypeName = null;
		if (request.getVehicleType() != null) {
			VehicleType vt = request.getVehicleType();
			if (vt.getVehicleTypeId() != null) {
				vehicleTypeId = vt.getVehicleTypeId();
			}
			if (vt.getName() != null) {
				vehicleTypeName = vt.getName();
			}
		}

		List<DeliveryWaypointSlimResponseDTO> waypoints = waypointService.readAll(request.getRequestId());

		return DeliveryRequestResponseDTO.builder().requestId(request.getRequestId())
				.startAddress(request.getStartAddress()).endAddress(request.getEndAddress())
				.memoToDriver(request.getMemoToDriver()).totalCargoCount(request.getTotalCargoCount())
				.distance(request.getDistance())
				.totalCargoWeight(request.getTotalCargoWeight()).estimatedFee(request.getEstimatedFee())
				.wantToStart(request.getWantToStart()).wantToEnd(request.getWantToEnd())
				.expectedPolyline(request.getExpectedPolyline()).expectedRoute(request.getExpectedRoute())
				.companyName(companyName).vehicleTypeId(vehicleTypeId).vehicleTypeName(vehicleTypeName)
				.waypoints(waypoints).build();

	}

	// 목록 출력 용, 필수 데이터 경량 조회.
	public DeliveryRequestSlimResponseDTO entityToSlimDto(DeliveryRequest request) {

		if (request == null) {
			return null;
		}
		
		Long vehicleTypeId = null;
		String vehicleTypeName = null;
		if (request.getVehicleType() != null) {
			VehicleType vt = request.getVehicleType();
			if (vt.getVehicleTypeId() != null) {
				vehicleTypeId = vt.getVehicleTypeId();
			}
			if (vt.getName() != null) {
				vehicleTypeName = vt.getName();
			}
		}

		return DeliveryRequestSlimResponseDTO.builder().requestId(request.getRequestId())
				.startAddress(request.getStartAddress()).endAddress(request.getEndAddress())
				.distance(request.getDistance())
				.vehicleTypeId(vehicleTypeId)
				.vehicleTypeName(vehicleTypeName)
				.estimatedFee(request.getEstimatedFee())
				.distance(request.getDistance()).createAt(request.getCreateAt()).status(request.getStatus())
				.wantToStart(request.getWantToStart()).wantToEnd(request.getWantToEnd()).build();
	}

	@Override
	public Long create(DeliveryRequestRequestDTO dto) {
		DeliveryRequest entity = reqDtoToEntity(dto);
		entity.setRequestId(null);
		DeliveryRequest saved = repository.save(entity);

		if (dto.getWaypoints() != null && !dto.getWaypoints().isEmpty()) {
			waypointService.createBatch(saved.getRequestId(), dto.getWaypoints());
		}

		return saved.getRequestId();
	}

	@Override
	@Transactional(readOnly = true)
	public DeliveryRequestSlimResponseDTO readSlim(Long requestId) {
		DeliveryRequest entity = repository.findById(requestId)
				.orElseThrow(() -> new NoSuchElementException("DeliveryRequest not found: " + requestId));
		return entityToSlimDto(entity);
	}

	// Service
	public DeliveryRequestResponseDTO readFull(Long id) {
		DeliveryRequest entity = repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("요청 ID " + id + "를 찾을 수 없습니다."));
		return entityToFullDto(entity); // 엔티티 → 전체 응답 DTO 변환
	}

	@Override
	public void update(Long requestId, DeliveryRequestRequestDTO dto) {
		DeliveryRequest entity = repository.findById(requestId)
				.orElseThrow(() -> new NoSuchElementException("DeliveryRequest not found: " + requestId));

		// 필요한 필드만 업데이트(추후 구성에 맞게 수정!)
		entity.updateStatus(dto.getStatus());
	}

	@Override
	public void delete(Long requestId) {
		if (!repository.existsById(requestId)) {
			throw new NoSuchElementException("DeliveryRequest not found: " + requestId);
		}
		repository.deleteById(requestId);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponseDTO<DeliveryRequestSlimResponseDTO> list(PageRequestDTO pageReq) {

		Page<DeliveryRequest> page = repository.findAll(pageReq.toPageable());

		List<DeliveryRequestSlimResponseDTO> dtoList = page.getContent().stream().map(this::entityToSlimDto) // 엔티티→슬림
																												// DTO
				.collect(Collectors.toList());

		return PageResponseDTO.<DeliveryRequestSlimResponseDTO>withAll().dtoList(dtoList).pageRequestDTO(pageReq)
				.totalCount(page.getTotalElements()).build();
	}

}
