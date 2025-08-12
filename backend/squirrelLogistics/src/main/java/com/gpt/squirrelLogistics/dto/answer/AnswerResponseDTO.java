package com.gpt.squirrelLogistics.dto.answer;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.dto.report.ReportResponseDTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerResponseDTO {
	private Long answerId; //답변 아이디.
	  
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //생성일.
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.
	
	private String content;//답변 내용
	
    private AdminUserResponseDTO adminUser; //관리자 아이디.
	private ReportResponseDTO report;//신고
}
