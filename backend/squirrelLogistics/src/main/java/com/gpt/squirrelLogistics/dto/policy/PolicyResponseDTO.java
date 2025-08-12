package com.gpt.squirrelLogistics.dto.policy;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.dto.admin.AdminUserResponseDTO;
import com.gpt.squirrelLogistics.enums.policy.PolicyTypeEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyResponseDTO {
	private Long policyId; //정책 아이디.
	private AdminUserResponseDTO adminUserDTO; //관리자 정보 객체.
	private PolicyTypeEnum type; //종류.
	private String title; //제목.
	private String content; //내용.

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //생성일.

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.
}
