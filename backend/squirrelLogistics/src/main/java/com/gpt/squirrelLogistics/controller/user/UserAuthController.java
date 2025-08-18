package com.gpt.squirrelLogistics.controller.user;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.login.LoginRequest;
import com.gpt.squirrelLogistics.dto.login.LoginResponse;
import com.gpt.squirrelLogistics.dto.regist.RegisterCompanyRequest;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import com.gpt.squirrelLogistics.dto.regist.RegisterResponse;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.user.AuthService;

import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/auth")
@RequiredArgsConstructor
public class UserAuthController {
	private final AuthenticationManager authManager;
	private final AuthService authService;
	private final JwtTokenProvider jwt;
	private final UserRepository userRepository;

	@PostMapping("/register/driver")
	public ResponseEntity<RegisterResponse> registerDriver(@RequestBody RegisterDriverRequest req) {
		return ResponseEntity.ok(authService.registerDriver(req));
	}

	@PostMapping("/register/company")
	public ResponseEntity<RegisterResponse> registerCompany(@RequestBody RegisterCompanyRequest req) {
		return ResponseEntity.ok(authService.registerCompany(req));
	}

	// 이메일 중복체크
	@GetMapping("/exists/email")
	public Map<String, Boolean> existsEmail(@RequestParam("email") String email) {
		return Map.of("exists", authService.existsByEmail(email));
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest req) {
		try {
			authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getLoginId(), req.getPassword()));

			User user = userRepository.findByLoginId(req.getLoginId())
					.orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

			user.setLastLogin(LocalDateTime.now());
			userRepository.save(user);

			String token = jwt.generateToken(user.getLoginId(), user.getRole().name(), user.getUserId());
			return ResponseEntity.ok(new LoginResponse(token, user.getUserId(), user.getName(), user.getRole().name()));
		} catch (BadCredentialsException e) {
			// ✅ 스택트레이스 없이 401 + 사용자 친화 메시지
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error", "Unauthorized", "message", "아이디 또는 비밀번호가 올바르지 않습니다."));
		} catch (UsernameNotFoundException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error", "Unauthorized", "message", "아이디 또는 비밀번호가 올바르지 않습니다."));
		}
	}
} 