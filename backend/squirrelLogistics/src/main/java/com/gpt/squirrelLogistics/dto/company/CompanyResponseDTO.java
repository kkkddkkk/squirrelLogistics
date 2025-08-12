package com.gpt.squirrelLogistics.dto.company;

import com.gpt.squirrelLogistics.dto.user.UserDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyResponseDTO {
	private Long companyId;//회사 ID
	
	private String address;//주소
	private String mainLoca;//기본 출발지

	private UserDTO user;//회원
}
