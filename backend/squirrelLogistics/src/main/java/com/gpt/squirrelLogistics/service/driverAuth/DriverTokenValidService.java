package com.gpt.squirrelLogistics.service.driverAuth;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class DriverTokenValidService {

	private final UserRepository userRepo;

	/** Authorization 헤더에서 Bearer 토큰만 추출 */
	public String extractBearerToken(String authHeader) {
		if (authHeader == null || authHeader.isBlank())
			return null;
		return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
	}

	/** ① 던지는 버전: 실패 시 AuthException */
	public Long getDriverIdOrThrow(String authHeader) {
		String token = extractBearerToken(authHeader);
		if (token == null) {
			throw new DriverAuthException(AuthErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
		}

		User user;
		try {
			user = getUserFromToken(token);
		} catch (Exception e) {
			throw new DriverAuthException(AuthErrorCode.TOKEN_INVALID, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
		}

		if (user.getRole() == null || user.getRole() != UserRoleEnum.DRIVER) {
			throw new DriverAuthException(AuthErrorCode.NOT_DRIVER, HttpStatus.FORBIDDEN, "드라이버 권한이 아닙니다.");
		}
		if (user.getDriver() == null) {
			throw new DriverAuthException(AuthErrorCode.DRIVER_NOT_FOUND, HttpStatus.UNAUTHORIZED, "드라이버 정보가 없습니다.");
		}
		return user.getDriver().getDriverId();
	}

	/** ② 안던지는 버전: AuthOutcome으로 반환(컨트롤러에서 바로 ResponseEntity 만들 때 용이) */
	public AuthOutcome resolve(String authHeader) {

		if (authHeader == null) {
			return new AuthOutcome.Failure(HttpStatus.UNAUTHORIZED, AuthErrorCode.UNAUTHORIZED, "인증 토큰이 없습니다.");
		}
		User user;
		try {
			user = getUserFromToken(authHeader);
		} catch (Exception e) {
			return new AuthOutcome.Failure(HttpStatus.UNAUTHORIZED, AuthErrorCode.TOKEN_INVALID,
					"유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.");
		}
		if (user.getRole() == null || user.getRole() != UserRoleEnum.DRIVER) {
			return new AuthOutcome.Failure(HttpStatus.FORBIDDEN, AuthErrorCode.NOT_DRIVER, "드라이버(운전자) 계정이 아닙니다.");
		}
		if (user.getDriver() == null) {
			return new AuthOutcome.Failure(HttpStatus.UNAUTHORIZED, AuthErrorCode.DRIVER_NOT_FOUND, "드라이버 정보가 없습니다.");
		}
		return new AuthOutcome.Success(user.getDriver().getDriverId());
	}

	public User getUserFromToken(String token) {
		// JWT 등으로 토큰 파싱
		Long userId = parseUserId(token);
		return userRepo.findById(userId).orElseThrow(() -> new UsernameNotFoundException("User not found"));
	}

	private Long parseUserId(String token) {
		Claims claims = Jwts.parserBuilder()
				.setSigningKey(Keys.hmacShaKeyFor("very-secret-key-change-me-please-256bit!".getBytes())).build()
				.parseClaimsJws(token.replace("Bearer ", "")).getBody();

		// 안전하게 uid 클레임을 Long으로 꺼내기
		return claims.get("uid", Number.class).longValue();
	}

	public boolean isCompanyToken(String token) {
	    if (token == null) {
	        return false;
	    }
	    User user = getUserFromToken(token);
	    if (user.getRole() == null) {
	        return false;
	    }
	    // 회사 전용 체크
	    return user.getRole() == UserRoleEnum.COMPANY;
	}

}
