package com.gpt.squirrelLogistics.dto.regist;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter
public class RegisterDriverRequest {
  private String loginId;
  private String name;
  private String email;
  private String password;
  private String phone;
  private String account;
  private String businessN;
  private LocalDateTime birthday;

  // driver-specific
  private String mainLoca;
  private String licenseNum;
  private LocalDateTime licenseDT;
  private Boolean drivable;

  // car (optional on register)
  private Long vehicleTypeId;
  private String carNum;
  private boolean agreeTerms;
}

