package com.gpt.squirrelLogistics.dto.deliveryWaypoint;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.enums.deliveryWaypoint.StatusEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryWaypointSlimResponseDTO {
	private Long waypointId;// 경유지 ID

	private String address;// 주소
	private int dropOrder;// 배송순서
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime arriveAt;//도착시간
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime droppedAt;//배송시간
	
	//경유지 위경도(작성자: 고은설)
	private double lat; 
    private double lng;
    
	private StatusEnum status;//경유지 상태
	
	private Long deliveryRequestId;//배송 요청 ID
	private Long handlingId;//취급유형 ID
	private String handlingTags;//취급유형 ID

	
}
