package com.gpt.squirrelLogistics.user.dto;

import com.gpt.squirrelLogistics.user.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter 
@AllArgsConstructor
public class RegisterResponse {
  private Long userId;
  private String loginId;
  private Role role;
}