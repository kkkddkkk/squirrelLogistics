package com.gpt.squirrelLogistics.dto.report;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import com.gpt.squirrelLogistics.enums.report.ReportCategoryEnum;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;
import com.gpt.squirrelLogistics.enums.report.ReportStatusEnum;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSlimResponseDTO {
	private Long reportId; //신고 아이디.
	private ReportReporterEnum reporter; //신고자.
	private String rTitle; //신고 제목.
	private String rContent; //신고 내용.
	private ReportStatusEnum rStatus; //신고 상태.
	private ReportCategoryEnum rCate; //신고 카테고리.
	private String place; //발생 장소.
	
	private Long deliveryAssignmentId; //할당 정보 객체 Id.

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //신고일.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.
}
