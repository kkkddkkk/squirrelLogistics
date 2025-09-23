package com.gpt.squirrelLogistics.dto.report;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportMonthlyCountDTO {

	private int year;//년
	private int month; //월
	private Long monthlyCount; //신고 건수

}

