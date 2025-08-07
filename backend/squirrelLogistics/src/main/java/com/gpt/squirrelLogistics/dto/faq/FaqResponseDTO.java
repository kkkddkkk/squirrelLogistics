package com.gpt.squirrelLogistics.dto.faq;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqResponseDTO {
	private Long faqId; //자주 묻는 질문 아이디.
	private AdminUserResponseDTO adminUserDTO; //관리자 정보 객체.
	private String question; //질문.
	private String answer; //답변.
	private FaqCategoryEnum category; //카테고리.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //등록일.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.
}
