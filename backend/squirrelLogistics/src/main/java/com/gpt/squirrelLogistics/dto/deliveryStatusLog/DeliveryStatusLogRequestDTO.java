package com.gpt.squirrelLogistics.dto.deliveryStatusLog;

import lombok.*;

import com.gpt.squirrelLogistics.enums.deliveryStatus.DeliveryStatusEnum;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryStatusLogRequestDTO {
	private DeliveryStatusEnum status; //배송 상태.
	private int lastVisitedWaypoint; //마지막 완료 경유지.
}
