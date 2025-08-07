package com.gpt.squirrelLogistics.dto.faq;

import com.gpt.squirrelLogistics.enums.faq.FaqCategoryEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqRequestDTO {
	private Long adminId; //관리자 아이디.
	private String question; //질문.
	private String answer; //답변.
	private FaqCategoryEnum category; //카테고리.
}
