package com.gpt.squirrelLogistics.dto.report;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailReportDTO {
	private Long reporterId;//신고자 ID
	private Long reportedId; // 신고자ID
	
	private ReportReporterEnum reporter;
	private String title;
	private String content;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //신고일.

}
