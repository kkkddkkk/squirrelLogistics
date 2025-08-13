package com.gpt.squirrelLogistics.dto.deliveryAssignment;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.actualDelivery.ActualDeliveryDTO;
import com.gpt.squirrelLogistics.dto.deliveryRequest.DeliveryRequestResponseDTO;
import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.payment.PaymentDTO;
import com.gpt.squirrelLogistics.enums.deliveryAssignment.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryAssignmentResponseDTO {
	private Long assignedId;// 요청 ID
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime assignedAt;//수락 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime completedAt;//종료 일시
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime cancelledAt;//취소일시
	
	private StatusEnum status;//수락 상태
	
	private DeliveryRequestResponseDTO deliveryRequest;//배송 요청
	private PaymentDTO payment;//결제
	private DriverResponseDTO driver;//운전자
	private ActualDeliveryDTO actualDelivery;//실제 운송
}
