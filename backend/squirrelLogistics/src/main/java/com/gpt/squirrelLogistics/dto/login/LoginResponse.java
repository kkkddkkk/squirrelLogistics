package com.gpt.squirrelLogistics.dto.login;

import lombok.Getter;

@Getter
public class LoginResponse {
	  private String accessToken;
	  private String tokenType = "Bearer";
	  private Long userId;
	  private String name;
	  private String role;
	  public LoginResponse(String token, Long userId, String name, String role){
	    this.accessToken = token; this.userId=userId; this.name=name; this.role=role;
	  }
}
