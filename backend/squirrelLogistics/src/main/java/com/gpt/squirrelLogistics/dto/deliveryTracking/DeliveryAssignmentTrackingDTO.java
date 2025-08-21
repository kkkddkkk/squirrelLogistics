package com.gpt.squirrelLogistics.dto.deliveryTracking;

import java.time.LocalDateTime;
import java.util.List;

import com.gpt.squirrelLogistics.dto.deliveryStatusLog.DeliveryStatusLogSlimResponseDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
@AllArgsConstructor
public class DeliveryAssignmentTrackingDTO {

	public Long assignedId;
	public Long deliveryRequestId;
	public DeliveryStatusLogSlimResponseDTO lastStatusLog;
	public String memoToDriver;
	public LocalDateTime wantToStart;
	public LocalDateTime wantToEnd;
	List<NavigateDeliveryDTO> navigate;
	
}
