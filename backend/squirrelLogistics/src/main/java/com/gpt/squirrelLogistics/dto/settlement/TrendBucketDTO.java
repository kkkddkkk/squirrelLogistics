package com.gpt.squirrelLogistics.dto.settlement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TrendBucketDTO {

	//작성자: 고은설.
	//목적: 관리자 정산 대시보드 기간별 매출 라인 그래프 출력을 위한 데이터 도출.
    private String bucket; // ISO8601 (KST).
    private String label;  // "YYYY-MM" / "YYYY-WW" / "YYYY-MM-DD".
    private long gross;
    private long fee;
    private long net;
}
