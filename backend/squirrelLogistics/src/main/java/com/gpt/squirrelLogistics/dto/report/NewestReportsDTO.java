package com.gpt.squirrelLogistics.dto.report;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.reportImage.ReportImageRequestDTO;
import com.gpt.squirrelLogistics.enums.report.ReportReporterEnum;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewestReportsDTO {

	private String title; //신고 상태.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //신고일.
}

