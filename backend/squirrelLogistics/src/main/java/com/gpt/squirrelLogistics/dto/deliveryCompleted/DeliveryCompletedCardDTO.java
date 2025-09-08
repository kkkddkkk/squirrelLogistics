package com.gpt.squirrelLogistics.dto.deliveryCompleted;

import java.time.LocalDateTime;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryCompletedCardDTO {

	//할당 번호.
	Long assignId;
	//상차지 주소.
	String startAddress;
	//최종 하차지 주소.
	String endAddress;
	//운송 완료 시간.
	LocalDateTime completedAt;
}
