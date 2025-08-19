package com.gpt.squirrelLogistics.service.user;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import com.gpt.squirrelLogistics.dto.user.KakaoToken;
import com.gpt.squirrelLogistics.dto.user.KakaoUserProfile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    @Value("${kakao.rest-key}")
    private String clientId;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    @Value("${kakao.client-secret:}") // 선택
    private String clientSecret;

    private final RestTemplate rest = new RestTemplate();

    public KakaoToken getToken(String code) {
        String url = "https://kauth.kakao.com/oauth/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);
        if (StringUtils.hasText(clientSecret)) params.add("client_secret", clientSecret);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        ResponseEntity<KakaoToken> resp = rest.postForEntity(url, new HttpEntity<>(params, headers), KakaoToken.class);
        return Objects.requireNonNull(resp.getBody(), "Kakao token empty");
    }

    public KakaoUserProfile getUserProfile(String accessToken) {
        String url = "https://kapi.kakao.com/v2/user/me";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        ResponseEntity<KakaoUserProfile> resp =
            rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), KakaoUserProfile.class);
        return Objects.requireNonNull(resp.getBody(), "Kakao profile empty");
    }
}
