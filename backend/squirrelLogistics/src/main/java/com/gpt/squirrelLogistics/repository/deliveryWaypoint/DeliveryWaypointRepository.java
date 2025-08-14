package com.gpt.squirrelLogistics.repository.deliveryWaypoint;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gpt.squirrelLogistics.entity.deliveryWaypoint.DeliveryWaypoint;

public interface DeliveryWaypointRepository extends JpaRepository<DeliveryWaypoint, Long> {

	List<DeliveryWaypoint> findAllByDeliveryRequest_RequestId(Long requestId);
    List<DeliveryWaypoint> findByDeliveryRequest_RequestIdOrderByDropOrderAsc(Long requestId);

}
