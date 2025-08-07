package com.gpt.squirrelLogistics.dto.admin;

import com.gpt.squirrelLogistics.entity.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponseDTO {

	private Long adminId; //관리자 아이디.
	private User userId; //회원 아이디.
}
