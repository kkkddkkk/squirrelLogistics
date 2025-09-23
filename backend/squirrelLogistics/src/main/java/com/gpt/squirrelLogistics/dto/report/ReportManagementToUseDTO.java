package com.gpt.squirrelLogistics.dto.report;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.reportImage.ReportImageRequestDTO;
import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportManagementToUseDTO {
	//신고 확인 게시판(상태, 카테고리, 신고자, 신고일, 제목)
	private ReportStatusEnum status; //신고 상태.
	private ReportCategoryEnum cate; //신고 카테고리
	private Long reportId;//신고Id
	private Long reporterId;//신고자 Id
	private String role; 
	private String reporterName;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
	private LocalDateTime regDate; //신고일.
	private String title;//신고제목

}

