package com.gpt.squirrelLogistics.dto.admin;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gpt.squirrelLogistics.enums.role.UserRoleEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDTO {

	private Long adminId; //관리자 아이디.
	private String email; //이메일.
	private String password; //비밀번호.
	private String name; //이름.
	private UserRoleEnum role; //권한.
    
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime lastLogin; //마지막 로그인 날짜.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate; //생성일.
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate; //수정일.

}
