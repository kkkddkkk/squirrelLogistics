package com.gpt.squirrelLogistics.dto.settlement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MethodAggDTO {

	//작성자: 고은설.
	//목적: 관리자 정산 대시보드 결제수단별 기간내 매출 막대 그래프 출력을 위한 데이터 도출.
	
	private String method;	//결제 수단(예: 카카오페이, 토스페이, 다날 등).
	private long gross;		//결제수단별 기간내 총매출.
	private long fee;		//결제수단별 기간내 총 수수료.
	private long net;		//결제수단별 기간내 총 순정산액.
}
