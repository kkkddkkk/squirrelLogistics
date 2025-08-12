package com.gpt.squirrelLogistics.user.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class RegisterCompanyRequest {
  private String loginId;
  private String name;         // 담당자명 또는 회사명 칸 분리 가능
  private String email;
  private String password;
  private String phone;
  private String account;
  private String businessN;
  private String address;
  private boolean agreeTerms;
}
