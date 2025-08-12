package com.gpt.squirrelLogistics.dto.regist;

import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter 
@AllArgsConstructor
public class RegisterResponse {
  private Long userId;
  private String loginId;
  private UserRoleEnum role;
}