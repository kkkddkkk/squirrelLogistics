package com.gpt.squirrelLogistics.dto.settlement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryDTO {

	//작성자: 고은설.
	//목적: 관리자 정산 대시보드 페이지 최상단 이번달 재무지표 집계란을 위한 데이터 도출.
	
	private String month;		//집계 대상 월.
	private long gross;			//총 매출.
	private long fee;			//수수료.
	private long net;			//순정산.
	private int completedCount;	//완료 정산 건.
}
