package com.gpt.squirrelLogistics.dto.settlement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnsettledDTO {
	
	//작성자: 고은설.
	//목적: 관리자 정산 대시보드 페이지 미정산건 갯수 및 금액 안내를 위한 데이터 도출.
	
	private int count;		//미정산 상태의 완료 결제건 수의 합.
    private long amount;	//미정산 상태의 완료 결제건 결제 금액의 합.
}
