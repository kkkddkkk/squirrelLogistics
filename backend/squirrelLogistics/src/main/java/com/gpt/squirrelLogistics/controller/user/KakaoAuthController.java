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

    // 카카오가 code를 전달하는 콜백
    @GetMapping("/callback")
    public ResponseEntity<?> callback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state // ✅ 역할 전달받기
    ) {
        KakaoToken token = kakaoOAuthService.getToken(code);
        KakaoUserProfile profile = kakaoOAuthService.getUserProfile(token.getAccessToken());

        //  신규 가입 시 사용할 역할
        UserRoleEnum desiredRole = toRole(state); // null이면 ETC

        //  서비스에서 역할을 반영하도록 오버로드(아래 서비스 수정 참고)
        User user = userService.findOrCreateFromKakao(profile, desiredRole);
        userService.updateLastLogin(user.getUserId());

        String accessToken = jwt.generateToken(user.getLoginId(), user.getRole().name(), user.getUserId());

        URI redirect = URI.create("http://localhost:3000/oauth/success"
                + "?token=" + accessToken
                + "&name=" + URLEncoder.encode(user.getName(), StandardCharsets.UTF_8)
                + "&role=" + user.getRole().name());
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(redirect);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    private UserRoleEnum toRole(String s) {
        if (s == null) return UserRoleEnum.ETC;
        switch (s.toUpperCase()) {
            case "DRIVER":  return UserRoleEnum.DRIVER;
            case "COMPANY": return UserRoleEnum.COMPANY;
            default:        return UserRoleEnum.ETC;
        }
    }
}