package com.gpt.squirrelLogistics.dto.policy;

import com.gpt.squirrelLogistics.enums.policy.PolicyTypeEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyRequestDTO {
	private Long adminId; //관리자 아이디.
	private PolicyTypeEnum type; //종류.
	private String title; //제목.
	private String content; //내용.
}
