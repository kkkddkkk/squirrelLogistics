package com.gpt.squirrelLogistics.controller.user;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

    // 카카오가 code를 전달하는 콜백
    @GetMapping("/callback")
    public ResponseEntity<?> callback(@RequestParam("code") String code) {
        // 1) code -> access token 교환
        KakaoToken token = kakaoOAuthService.getToken(code);

        // 2) 토큰으로 사용자 정보 조회
        KakaoUserProfile profile = kakaoOAuthService.getUserProfile(token.getAccessToken());

        // 3) 우리 서비스 사용자로 매핑/가입 or 조회
        User user = userService.findOrCreateFromKakao(profile);
        userService.updateLastLogin(user.getUserId());

        // 4) JWT 발급
        String accessToken = jwt.generateToken(user.getLoginId(), user.getRole().name(), user.getUserId());

        // 5) 프런트로 리다이렉트(쿼리/프래그먼트로 전달)
        // ex) http://localhost:3000?token=...&name=...&role=...
        URI redirect = URI.create("http://localhost:3000/oauth/success"
                + "?token=" + accessToken
                + "&name=" + URLEncoder.encode(user.getName(), StandardCharsets.UTF_8)
                + "&role=" + user.getRole().name());
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(redirect);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}