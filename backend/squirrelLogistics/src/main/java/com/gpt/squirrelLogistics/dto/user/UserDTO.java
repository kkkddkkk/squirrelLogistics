package com.gpt.squirrelLogistics.dto.user;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.gpt.squirrelLogistics.enums.role.UserRoleEnum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
	private Long userId;//회원 ID
	
	private String loginId;//로그인 ID
	private String name;//이름
	private String email;//이메일
	private String Pnumber;//전화번호
	private String password;//비밀번호
	private String account;//계좌번호
	private String businessN;//사업자등록번호
	private String birthday;//생년월일
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDate;//가입일자
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modiDate;//수정일
	
	@JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime lastLogin;//마지막 로그인
	
	private UserRoleEnum role;//권한
}
