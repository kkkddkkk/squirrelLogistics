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
public class DeliveryStatusLogResponseDTO {
	private Long statusId; //상태 로그 아이디.
//	private DeliveryAssignment deliveryAssignment; //할당 정보 객체.

	private DeliveryStatusEnum status; //배송 상태.
	private int currentWaypoint; //마지막 완료 경유지.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createdAt; //기록 시간.

}
