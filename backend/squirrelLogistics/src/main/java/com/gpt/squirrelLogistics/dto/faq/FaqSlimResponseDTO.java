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
public class FaqSlimResponseDTO {
	private Long faqId; //자주 묻는 질문 아이디.
	private Long adminUserId; //관리자 ID.
	private String adminUserName;//관리자 이름
	private String question; //질문.
	private String answer; //답변.
	private FaqCategoryEnum category; //카테고리.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //등록일.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.
}
