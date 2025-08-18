package com.gpt.squirrelLogistics.service.deliveryCargo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoRequestDTO;
import com.gpt.squirrelLogistics.entity.cargoType.CargoType;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;
import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;
import com.gpt.squirrelLogistics.repository.deliveryCargo.DeliveryCargoRepository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional
public class DeliveryCargoServiceImpl implements DelilveryCargoService {

	private final DeliveryCargoRepository cargoRepository;
	private final EntityManager em;
	@Override
	public Long create(Long waypointId, DeliveryCargoRequestDTO dto) {
		// 추가 SELECT 없이 프록시로만 참조(waypointId가 확실할 때 유리)
		DeliveryWaypoint wpRef = em.getReference(DeliveryWaypoint.class, waypointId);
		CargoType handlingRef = em.getReference(CargoType.class, dto.getHandlingId());

		DeliveryCargo cargo = DeliveryCargo.builder()
				.description(dto.getDescription())
				.droppedAt(dto.getDroppedAt())
				.deliveryWaypoint(wpRef)
				.cargoType(handlingRef)
				.build();

		cargoRepository.save(cargo);
		return cargo.getCargoId();
	}

}
