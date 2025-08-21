package com.gpt.squirrelLogistics.service.deliveryWaypoint;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.common.LatLng;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointRequestDTO;
import com.gpt.squirrelLogistics.dto.deliveryWaypoint.DeliveryWaypointSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.external.api.kakao.KakaoLocalClient;
import com.gpt.squirrelLogistics.repository.deliveryCargo.DeliveryCargoRepository;
import com.gpt.squirrelLogistics.repository.deliveryRequest.DeliveryRequestRepository;
import com.gpt.squirrelLogistics.repository.deliveryWaypoint.DeliveryWaypointRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class DeliveryWaypointServiceImpl implements DeliveryWaypointService {

	private final DeliveryWaypointRepository waypointrepo;
	private final DeliveryRequestRepository requestRepo;
	private final DeliveryCargoRepository cargoRepository;

	private final KakaoLocalClient localClient;

	// 요청 DTO => 엔티티 전환.
	private DeliveryWaypoint reqDtoToEntity(DeliveryRequest parent, DeliveryWaypointRequestDTO request) {
		if (parent == null || request == null) {
			return null;
		}

		return DeliveryWaypoint.builder().address(request.getAddress()).dropOrder(request.getDropOrder())
				.status(request.getStatus()).deliveryRequest(parent).build();

	}

	// 엔티티 => 경량 응답 DTO 전환.
	private DeliveryWaypointSlimResponseDTO entityToSlimDto(DeliveryWaypoint entity) {

		log.info(entity.getAddress());

		LatLng latLng = localClient.geocode(entity.getAddress());

		log.info("latLng is: " + latLng);

		if (!cargoRepository.existsByDeliveryWaypoint_WaypointId(entity.getWaypointId())) {
			throw new NoSuchElementException("DeliveryCargo not found: " + entity.getWaypointId());
		}

		var opt = cargoRepository.findByDeliveryWaypoint_WaypointId(entity.getWaypointId());
		DeliveryCargo cargoRef = opt.orElse(null);

		return DeliveryWaypointSlimResponseDTO.builder().waypointId(entity.getWaypointId()).address(entity.getAddress())
				.dropOrder(entity.getDropOrder()).arriveAt(entity.getArriveAt()).droppedAt(entity.getDroppedAt())
				.status(entity.getStatus())
				.deliveryRequestId(
						entity.getDeliveryRequest() != null ? entity.getDeliveryRequest().getRequestId() : null)
				.handlingId(cargoRef.getCargoType().getHandlingId())
				.handlingTags(cargoRef.getCargoType().getHandlingTags()).lat(latLng.getLat()).lng(latLng.getLng())
				.build();

	}

	// 경유지 엔티티 추가.
	@Override
	public Long create(DeliveryRequest parent, DeliveryWaypointRequestDTO dto) {
		DeliveryWaypoint resultEntity = reqDtoToEntity(parent, dto);
		waypointrepo.save(resultEntity);
		return resultEntity.getWaypointId();
	}

	// 개별 경유지 정보 경량 읽기.
	@Override
	@Transactional(readOnly = true)
	public DeliveryWaypointSlimResponseDTO readSlim(Long waypointId) {

		DeliveryWaypoint foundEntity = waypointrepo.findById(waypointId)
				.orElseThrow(() -> new NoSuchElementException("DeliveryWaypoint not found: " + waypointId));
		return entityToSlimDto(foundEntity);
	}

	@Override
	@Transactional(readOnly = true)
	public List<DeliveryWaypointSlimResponseDTO> readAll(long requestId) {

		// requestId에 해당하는 DeliveryWaypoint를 dropOrder 오른차순으로 정렬 후 List로 반환.
		return waypointrepo.findByDeliveryRequest_RequestIdOrderByDropOrderAsc(requestId).stream()
				.map(this::entityToSlimDto).toList();
	}

	@Override
	public void update(Long waypointId, DeliveryWaypointRequestDTO dto) {

		DeliveryWaypoint foundEntity = waypointrepo.findById(waypointId)
				.orElseThrow(() -> new NoSuchElementException("DeliveryWaypoint not found: " + waypointId));

		foundEntity.updateAddress(dto.getAddress());
		foundEntity.updateDropOrder(dto.getDropOrder());
		foundEntity.updateStatus(dto.getStatus());
		foundEntity.updateArriveAt(dto.getArriveAt());
		foundEntity.updateDroppedAt(dto.getDroppedAt());
	}

	@Override
	public void delete(Long waypointId) {

		if (!waypointrepo.existsById(waypointId)) {
			throw new NoSuchElementException("DeliveryWaypoint not found: " + waypointId);
		}
		waypointrepo.deleteById(waypointId);
	}

	@Override
	public void createBatch(DeliveryRequest parent, List<DeliveryWaypointRequestDTO> dtos) {
		if (dtos == null || dtos.isEmpty() || parent == null)
			return;

		List<DeliveryWaypoint> entities = dtos.stream()
				.sorted(Comparator.comparingInt(DeliveryWaypointRequestDTO::getDropOrder))
				.map(w -> DeliveryWaypoint.builder().address(w.getAddress()).dropOrder(w.getDropOrder())
						.arriveAt(w.getArriveAt()).droppedAt(w.getDroppedAt()).status(w.getStatus())
						.deliveryRequest(parent).build())
				.toList();

		waypointrepo.saveAll(entities);

	}

}
