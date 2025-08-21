package com.gpt.squirrelLogistics.dto.deliveryTracking;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Builder
@AllArgsConstructor
@Data
public class DeliveryAssignmentTrackingHeaderDTO {

	  public Long assignedId;
	  public Long requestId;
	  public String startAddress;
	  public String memoToDriver;
	  public LocalDateTime wantToStart;
	  public LocalDateTime wantToEnd;
}
