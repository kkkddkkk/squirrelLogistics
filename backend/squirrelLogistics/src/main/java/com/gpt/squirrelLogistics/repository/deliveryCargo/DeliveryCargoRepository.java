package com.gpt.squirrelLogistics.repository.deliveryCargo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;
import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;

public interface DeliveryCargoRepository extends JpaRepository<DeliveryCargo, Long> {

	boolean existsByDeliveryWaypoint_WaypointId(Long waypointId);

	@EntityGraph(attributePaths = "cargoType")
	Optional<DeliveryCargo> findByDeliveryWaypoint_WaypointId(Long waypointId);

	@Query("""
			select new com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO(
			  c.cargoId,
			  w.waypointId,
			  ct.handlingId,
			  ct.handlingTags,
			  c.description,
			  c.droppedAt
			)
			from DeliveryCargo c
			join c.deliveryWaypoint w
			join c.cargoType ct
			where w.deliveryRequest.requestId = :requestId
			  and c.cargoId = (
			    select max(c2.cargoId)
			    from DeliveryCargo c2
			    where c2.deliveryWaypoint = w
			  )
			""")
	List<DeliveryCargoSlimResponseDTO> findCargoOnePerWaypoint(@Param("requestId") Long requestId);
}
