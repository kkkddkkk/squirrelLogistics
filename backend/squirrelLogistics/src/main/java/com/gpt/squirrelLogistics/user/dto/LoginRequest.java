package com.gpt.squirrelLogistics.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
  private String loginId;
  private String password;
}