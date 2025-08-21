package com.gpt.squirrelLogistics.dto.deliveryWaypoint;

import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class DeliveryWaypointTrackingDTO {
	private Long waypointId;
	private Integer dropOrder;
	private String address;
	private DeliveryCargoSlimResponseDTO cargos;
}
