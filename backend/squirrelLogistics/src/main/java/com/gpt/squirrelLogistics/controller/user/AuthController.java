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
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.driver.Driver;
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
	private final UserRepository userRepo;

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

			if (user.getRole() == UserRoleEnum.ETC) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("error", "Forbidden", "message", "탈퇴 처리된 계정입니다."));
			}

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
	    String roleStr = body.getOrDefault("role", "ETC"); // "DRIVER" | "COMPANY" | "ETC"

	    var payload = googleVerifier.verify(idToken);
	    String googleId = payload.getSubject();
	    String email    = payload.getEmail();
	    String name     = (String) payload.get("name");
	    String loginId  = "google_" + googleId;

	    UserRoleEnum desiredRole = toRole(roleStr);

	    // 1) ETC 요청은 즉시 거부(신규든 기존이든 정책상 금지)
	    if (desiredRole == UserRoleEnum.ETC) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                .body(Map.of("error","Forbidden","message","탈퇴/보류 상태로는 로그인할 수 없습니다."));
	    }

	    User user = userRepository.findByLoginId(loginId).orElse(null);

	    if (user == null) {
	        // 2) 신규 소셜 가입 (ETC가 아님)
	        user = new User();
	        user.setLoginId(loginId);
	        user.setEmail(email);
	        user.setName(name != null ? name : "GoogleUser");
	        user.setPassword("{noop}");
	        user.setRole(desiredRole);       // DRIVER 또는 COMPANY
	        user.setRegDate(LocalDateTime.now());
	        user.setSns_login(true);

	        // 역할별 부속 엔티티 생성
	        if (desiredRole == UserRoleEnum.COMPANY) {
	            Company c = new Company();
	            c.setUser(user);
	            user.setCompany(c);
	        } else if (desiredRole == UserRoleEnum.DRIVER) {
	            Driver d = new Driver();
	            d.setUser(user);
	            user.setDriver(d);
	        }

	        userRepository.save(user);
	    } else {
	        // 3) 기존 유저가 ETC면 로그인 금지(자동 승격 없음)
	        if (user.getRole() == UserRoleEnum.ETC) {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN)
	                    .body(Map.of("error","Forbidden","message","탈퇴 처리된 계정입니다."));
	        }
	        // 4) 기존 유저는 역할 유지(원하면 여기서도 변경 금지)
	        //    부속 엔티티가 없다면 보강만 수행(선택)
	        if (user.getRole() == UserRoleEnum.DRIVER && user.getDriver() == null) {
	            Driver d = new Driver();
	            d.setUser(user);
	            user.setDriver(d);
	        }
	        if (user.getRole() == UserRoleEnum.COMPANY && user.getCompany() == null) {
	            Company c = new Company();
	            c.setUser(user);
	            user.setCompany(c);
	        }
	        // 기본 정보 보정(옵션)
	        if (user.getEmail() == null && email != null) user.setEmail(email);
	        if (user.getName() == null  && name  != null) user.setName(name);
	    }

	    user.setLastLogin(LocalDateTime.now());
	    userRepository.save(user);

	    String token = jwt.generateToken(user.getLoginId(), user.getRole().name(), user.getUserId());
	    return ResponseEntity.ok(Map.of(
	            "accessToken", token,
	            "tokenType", "Bearer",
	            "userId", user.getUserId(),
	            "name", user.getName(),
	            "role", user.getRole().name()
	    ));
	}

	private UserRoleEnum toRole(String s) {
	    if (s == null) return UserRoleEnum.ETC;
	    try { return UserRoleEnum.valueOf(s.toUpperCase()); }
	    catch (Exception e) { return UserRoleEnum.ETC; }
	}

	/** Google 재인증: 기존 사용자의 Google 토큰 재검증 */
	@PostMapping("/google/reverify")
	public ResponseEntity<?> googleReverify(@RequestBody Map<String, String> body) throws Exception {
		try {
			String credential = body.get("credential");
			if (credential == null) {
				return ResponseEntity.badRequest().body(Map.of("error", "credential is required"));
			}

			// Google 토큰 검증
			var payload = googleVerifier.verify(credential);
			String googleId = payload.getSubject();
			String email = payload.getEmail();

			// 기존 사용자 확인
			String loginId = "google_" + googleId;
			User user = userRepository.findByLoginId(loginId)
					.orElseThrow(() -> new IllegalArgumentException("해당 Google 계정으로 가입된 사용자를 찾을 수 없습니다."));

			// 재인증 성공 응답
			return ResponseEntity.ok(Map.of("success", true, "message", "Google 재인증이 완료되었습니다.", "userId",
					user.getUserId(), "name", user.getName(), "email", email));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(Map.of("error", "재인증 실패", "message", "Google 재인증에 실패했습니다."));
		}
	}


}