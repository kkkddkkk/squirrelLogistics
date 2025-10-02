package com.gpt.squirrelLogistics.controller.user;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.user.KakaoToken;
import com.gpt.squirrelLogistics.dto.user.KakaoUserProfile;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.service.user.KakaoOAuthService;
import com.gpt.squirrelLogistics.service.user.KakaoUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/oauth/kakao")
@RequiredArgsConstructor
public class KakaoAuthController {

	private final KakaoOAuthService kakaoOAuthService;
	private final JwtTokenProvider jwt;
	private final KakaoUserService userService; // findOrCreate, updateLastLogin 등

//	private static final String FRONT = "http://localhost:3000";
	private static final String FRONT = "https://squirrellogistics.vercel.app";

	// 카카오가 code를 전달하는 콜백
	@GetMapping("/callback")
	public ResponseEntity<Void> callback(@RequestParam("code") String code,
			@RequestParam(value = "state", required = false) String state) {
		try {
			KakaoToken token = kakaoOAuthService.getToken(code);
			KakaoUserProfile profile = kakaoOAuthService.getUserProfile(token.getAccessToken());

			UserRoleEnum desiredRole = toRole(state); // DRIVER | COMPANY | ETC

			// 프론트에서 ETC로 들어오면 바로 실패 리다이렉트
			if (desiredRole == UserRoleEnum.ETC) {
				return redirectFail("withdrawn"); // 탈퇴/보류
			}

			User user = userService.findOrCreateFromKakao(profile, desiredRole);

			// 이미 탈퇴(ETC) 계정인 경우도 실패로 보냄
			if (user.getRole() == UserRoleEnum.ETC) {
				return redirectFail("withdrawn");
			}

			String accessToken = jwt.generateToken(user.getLoginId(), user.getRole().name(), user.getUserId());

			URI ok = URI.create(FRONT + "/oauth/success" + "?token=" + accessToken + "&name="
					+ URLEncoder.encode(user.getName(), StandardCharsets.UTF_8) + "&role=" + user.getRole().name());

			return ResponseEntity.status(HttpStatus.FOUND).location(ok).build();

		} catch (Exception e) {
			return redirectFail("kakao_error");
		}
	}

	private ResponseEntity<Void> redirectFail(String reason) {
		URI fail = URI.create(FRONT + "/oauth/failure?reason=" + reason);
		return ResponseEntity.status(HttpStatus.FOUND).location(fail).build(); // 302
	}

	private UserRoleEnum toRole(String s) {
		if (s == null)
			return UserRoleEnum.ETC;
		try {
			return UserRoleEnum.valueOf(s.toUpperCase());
		} catch (Exception e) {
			return UserRoleEnum.ETC;
		}
	}
}