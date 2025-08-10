package com.gpt.squirrelLogistics.user.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.user.dto.RegisterCompanyRequest;
import com.gpt.squirrelLogistics.user.dto.RegisterDriverRequest;
import com.gpt.squirrelLogistics.user.dto.RegisterResponse;
import com.gpt.squirrelLogistics.user.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/register/driver")
  public ResponseEntity<RegisterResponse> registerDriver(@RequestBody RegisterDriverRequest req) {
    return ResponseEntity.ok(authService.registerDriver(req));
  }

  @PostMapping("/register/company")
  public ResponseEntity<RegisterResponse> registerCompany(@RequestBody RegisterCompanyRequest req) {
    return ResponseEntity.ok(authService.registerCompany(req));
  }

  // 아이디/이메일 중복체크
  @GetMapping("/exists/loginId")
  public Map<String, Boolean> existsLoginId(@RequestParam("loginId") String loginId) {
    return Map.of("exists", authService.existsLoginId(loginId));
  }

  @GetMapping("/exists/email")
  public Map<String, Boolean> existsEmail(@RequestParam("email") String email) {
    return Map.of("exists", authService.existsByEmail(email));
  }
}