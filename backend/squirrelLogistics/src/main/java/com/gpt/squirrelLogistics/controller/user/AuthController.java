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
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.user.AuthService;
import com.gpt.squirrelLogistics.service.user.GoogleVerifier;

import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthenticationManager authManager;
	private final AuthService authService;
	private final JwtTokenProvider jwt;
	private final UserRepository userRepository;
	private final GoogleVerifier googleVerifier;

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

	/** Google OAuth: 프론트에서 받은 idToken으로 로그인/회원연동 후 우리 JWT 발급 */
	@PostMapping("/oauth/google")
	public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) throws Exception {
		String idToken = body.get("idToken");
		String roleStr = body.getOrDefault("role", "ETC"); // 프론트에서 넘어온 role(Optional)

		var payload = googleVerifier.verify(idToken);
		String googleId = payload.getSubject(); // 구글 sub
		String email = payload.getEmail();
		String name = (String) payload.get("name");

		String loginId = "google_" + googleId;

		User user = userRepository.findByLoginId(loginId).orElse(null);
		if (user == null) {
			// 신규 가입: 프론트에서 고른 역할을 반영
			UserRoleEnum role = toRole(roleStr); // 아래 helper 참고
			user = new User();
			user.setLoginId(loginId);
			user.setEmail(email);
			user.setName(name != null ? name : "GoogleUser");
			user.setPassword("{noop}"); // 소셜은 패스워드 미사용
			user.setRole(role);
			user.setRegDate(LocalDateTime.now());
			user.setSns_login(true);
		} else {
			// ✅ 기존 유저: 원칙적으로 role 유지
			// - 만약 초기 가입을 ETC로 했고, 이번에 의미있는 역할이 들어오면 1회 갱신하고 싶다면:
			if (user.getRole() == UserRoleEnum.ETC) {
				user.setRole(toRole(roleStr));
			}
		}

		user.setLastLogin(LocalDateTime.now());
		userRepository.save(user);

		String token = jwt.generateToken(user.getLoginId(), user.getRole().name(), user.getUserId());
		return ResponseEntity.ok(Map.of("accessToken", token, "tokenType", "Bearer", "userId", user.getUserId(), "name",
				user.getName(), "role", user.getRole().name()));
	}

	/** 문자열 -> Enum 변환(허용값만) */
	private UserRoleEnum toRole(String s) {
		if (s == null)
			return UserRoleEnum.ETC;
		switch (s.toUpperCase()) {
		case "DRIVER":
			return UserRoleEnum.DRIVER;
		case "COMPANY":
			return UserRoleEnum.COMPANY;
		default:
			return UserRoleEnum.ETC;
		}
	}
}