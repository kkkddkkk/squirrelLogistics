package com.gpt.squirrelLogistics.dto.report;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailReportContainsUsersDTO {
	private Long reporterId;//신고자 ID
	private String reporterName;
	private String reporterNum;
	private Long reportedId; // 신고자ID
	private String reportedName;
	private String reportedNum;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //신고일.
	
	private List<String> imgUrls;
	
	private ReportReporterEnum reporter;
	private String title;
	private String content;
	
	private Long answerId;
	private String answerContent;

}
