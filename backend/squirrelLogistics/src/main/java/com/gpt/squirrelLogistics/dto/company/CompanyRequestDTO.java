package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyRequestDTO {
	private Long companyId;//회사 ID
	
	private String address;//주소
	private String mainLoca;//기본 출발지

	private Long userId;//회원ID
}
