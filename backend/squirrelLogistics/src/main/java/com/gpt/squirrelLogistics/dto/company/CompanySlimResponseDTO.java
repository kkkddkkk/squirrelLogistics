package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanySlimResponseDTO {
	private Long companyId;//회사 ID
	
	private String address;//주소
	private String mainLoca;//기본 출발지

	private Long userId;//회원 ID
	private String companyName;//회사명(작성자: 고은설).

}
