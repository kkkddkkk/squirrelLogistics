package com.gpt.squirrelLogistics.dto.deliveryWaypoint;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.entity.deliveryRequest.DeliveryRequest;
import com.gpt.squirrelLogistics.enums.deliveryWaypoint.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryWaypointResponseDTO {
	private Long waypointId;// 경유지 ID

	private String address;// 주소
	private int order;// 배송순서
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime arriveAt;//도착시간
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime droppedAt;//배송시간
	
	private StatusEnum status;//경유지 상태
	
	private DeliveryRequest deliveryRequest;//배송 요청
}
