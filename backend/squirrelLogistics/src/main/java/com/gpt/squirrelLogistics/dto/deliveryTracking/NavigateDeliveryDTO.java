package com.gpt.squirrelLogistics.dto.deliveryTracking;

import com.gpt.squirrelLogistics.dto.deliveryCargo.DeliveryCargoSlimResponseDTO;

import lombok.Builder;

@Builder
public class NavigateDeliveryDTO {
	public String address;
	public String expectedPolyline;
	public String expectedRoute;
	public Long distance;
	public Long duration;
	public Long waypointId;
	public DeliveryCargoSlimResponseDTO cargos;
}
