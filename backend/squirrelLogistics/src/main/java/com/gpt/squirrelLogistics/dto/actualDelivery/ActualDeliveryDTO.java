package com.gpt.squirrelLogistics.dto.actualDelivery;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActualDeliveryDTO {
	private Long actualDeliveryId;//실제운송 ID
	
	private Long distance;//총 거리
	private Long weight;//총 무게
	private boolean mountainous;//산간지역 여부
	private boolean caution;//취급주의 여부
	private Long actualFee;//총 금액
	
	//작성자: 고은설.
	private String actualPolyline;//예상 폴리라인

}
