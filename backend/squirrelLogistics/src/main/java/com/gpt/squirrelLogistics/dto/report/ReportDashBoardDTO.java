package com.gpt.squirrelLogistics.dto.report;

import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDashBoardDTO {
	
	List<ReportStatusCountDTO> statusCount;
	List<NewestReportsDTO> newestReports;
	List<MostReportedDashBoardDTO> mostReported;
	List<ReportCateCountDTO> cateCount;
	List<ReportMonthlyCountDTO> monthlyCount;
}
