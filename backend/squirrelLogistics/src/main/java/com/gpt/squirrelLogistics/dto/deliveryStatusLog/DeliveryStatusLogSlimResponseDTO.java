package com.gpt.squirrelLogistics.dto.deliveryStatusLog;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryStatusLogSlimResponseDTO {

	private Long statusId; // 상태 로그 아이디.
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createdAt; // 기록 시간.
	private int lastVisitedWaypoint; // 마지막 완료 경유지.
	private DeliveryStatusEnum status; // 배송 상태.
	private Long deliveryAssignmentId; // 할당 아이디.

//	public DeliveryStatusLogSlimResponseDTO(Long statusId, DeliveryStatusEnum status, LocalDateTime createdAt) {
//		this.statusId = statusId;
//		this.status = status;
//		this.createdAt = createdAt;
//	}

	public DeliveryStatusLogSlimResponseDTO(Long statusId, LocalDateTime createdAt, Integer lastVisitedWaypoint,
			DeliveryStatusEnum status, Long deliveryAssignmentId) {
		this.statusId = statusId;
		this.createdAt = createdAt;
		this.lastVisitedWaypoint = lastVisitedWaypoint;
		this.status = status;
		this.deliveryAssignmentId = deliveryAssignmentId;
	}

}
