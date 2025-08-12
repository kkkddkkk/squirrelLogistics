package com.gpt.squirrelLogistics.dto.term;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TermRequestDTO {
	private Long termId;//약관 ID
	
	private String termName;//약관
	private String termContent;//약관내용
	private boolean isRequired;//약관 필수 여부
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createDT;//생성일
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime updateDT;//수정일

	private Long userId;//회원ID
}
