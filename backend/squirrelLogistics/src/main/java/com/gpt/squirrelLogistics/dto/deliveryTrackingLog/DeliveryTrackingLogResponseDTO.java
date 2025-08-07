package com.gpt.squirrelLogistics.dto.deliveryTrackingLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryTrackingLogResponseDTO {

	private Long trackingId; //추적 로그 아이디.

//	private DeliveryAssignment deliveryAssignment; //할당 정보 객체.

	private BigDecimal lat; //위도.
	private BigDecimal lng; //경도.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createdAt; //기록 시간.
}
