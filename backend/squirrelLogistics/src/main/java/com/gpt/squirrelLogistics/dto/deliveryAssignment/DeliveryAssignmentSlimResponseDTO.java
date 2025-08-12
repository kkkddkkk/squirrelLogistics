package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.enums.deliveryRequest.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryAssignmentSlimResponseDTO {
	private Long assignedId;// 요청 ID
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime assignedAt;//수락 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime completedAt;//종료 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime cancelledAt;//취소일시
	
	private StatusEnum status;//수락 상태
	
	private Long deliveryRequestId;//배송 요청 ID
	private Long paymentId;//결제 ID
	private Long driverId;//운전자 ID
	private Long actualDeliveryId;//실제 운송 ID
}
