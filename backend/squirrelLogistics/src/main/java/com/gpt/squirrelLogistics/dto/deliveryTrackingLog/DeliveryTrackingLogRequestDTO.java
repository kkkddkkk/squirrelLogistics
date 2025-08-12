package com.gpt.squirrelLogistics.dto.deliveryTrackingLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryTrackingLogRequestDTO {
	
	private Long deliveryAssignmentId; //할당 아이디.
    private BigDecimal lat; //위도.
    private BigDecimal lng; //경도.
}
