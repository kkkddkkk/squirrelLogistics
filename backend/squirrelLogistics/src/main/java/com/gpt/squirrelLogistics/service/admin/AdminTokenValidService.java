package com.gpt.squirrelLogistics.service.admin;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.admin.AdminUserRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.driverAuth.AuthErrorCode;
import com.gpt.squirrelLogistics.service.driverAuth.AuthOutcome;
import com.gpt.squirrelLogistics.service.driverAuth.DriverTokenValidService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class AdminTokenValidService {

	private final UserRepository userRepo;
	private final AdminUserRepository adminRepo;

	public String extractBearerToken(String authHeader) {
		if (authHeader == null || authHeader.isBlank())
			return null;
		return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
	}

	public User getUserFromToken(String token) {
		// JWT 토큰 파싱.
		Long userId = parseUserId(token);
		return userRepo.findById(userId).orElse(null);
	}

	private Long parseUserId(String token) {
		Claims claims = Jwts.parserBuilder()
				.setSigningKey(Keys.hmacShaKeyFor("very-secret-key-change-me-please-256bit!".getBytes())).build()
				.parseClaimsJws(token.replace("Bearer ", "")).getBody();

		return claims.get("uid", Number.class).longValue();
	}

	public AuthOutcome resolve(String authHeader) {

		if (authHeader == null) {
			return new AuthOutcome.Failure(HttpStatus.UNAUTHORIZED, AuthErrorCode.UNAUTHORIZED, "인증 토큰이 없습니다.");
		}

		User user = getUserFromToken(authHeader);

		if (user == null) {
			return new AuthOutcome.Failure(HttpStatus.UNAUTHORIZED, AuthErrorCode.TOKEN_INVALID,
					"유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.");
		}

		return new AuthOutcome.Success(user.getUserId());
	}

	public boolean isAdmin(Long id) {
		User user = userRepo.findById(id).orElse(null);
		if (user != null && user.getRole() == UserRoleEnum.ADMIN) {
			return true;
		}
		return false;
	}

	public AuthOutcome getAdmin(Long userId) {
		Optional<Long> adminId = adminRepo.findAdminIdByUserId(userId);

		if (adminId.isEmpty()) {
			return new AuthOutcome.Failure(HttpStatus.UNAUTHORIZED,
					AuthErrorCode.NOT_ADMIN, "관리자만 접근 가능한 페이지입니다.");
		}
		
		return new AuthOutcome.Success(adminId.get());
	}
}
