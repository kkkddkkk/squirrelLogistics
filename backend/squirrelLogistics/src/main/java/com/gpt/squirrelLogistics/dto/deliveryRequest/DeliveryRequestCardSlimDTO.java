package com.gpt.squirrelLogistics.dto.deliveryRequest;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeliveryRequestCardSlimDTO {

	public Long requestId;
	public LocalDateTime createAt;
	public String startAddress;
	public String endAddress;
	public Long distance;
	public Long estimatedFee;
	public String userName;
	public String vehicleTypeName;
	private Long waypointCount;

	public DeliveryRequestCardSlimDTO(Long requestId, LocalDateTime createAt, String startAddress, String endAddress,
			Long distance, Long estimatedFee, String userName, String vehicleTypeName, Long waypointCount) {
		this.requestId = requestId;
		this.createAt = createAt;
		this.startAddress = startAddress;
		this.endAddress = endAddress;
		this.distance = distance;
		this.estimatedFee = estimatedFee;
		this.userName = userName;
		this.vehicleTypeName = vehicleTypeName;
		this.waypointCount = waypointCount;
	}

}
