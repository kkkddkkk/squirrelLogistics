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
	private User user; //회원 정보 객체.
	private String name; 
    private String email; 
}
