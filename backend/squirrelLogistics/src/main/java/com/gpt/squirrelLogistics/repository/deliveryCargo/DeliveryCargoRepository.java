package com.gpt.squirrelLogistics.repository.deliveryCargo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryCargo.DeliveryCargo;

public interface DeliveryCargoRepository extends JpaRepository<DeliveryCargo, Long> {
    boolean existsByDeliveryWaypoint_WaypointId(Long waypointId);
    DeliveryCargo findByDeliveryWaypoint_WaypointId(Long waypointId);

}
