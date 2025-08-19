package com.gpt.squirrelLogistics.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class KakaoUserProfile {
    private Long id;
    @JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;

    @Data
    public static class KakaoAccount {
        private String email;
        private Profile profile;
        @Data public static class Profile {
            private String nickname;
            @JsonProperty("profile_image_url") private String profileImageUrl;
        }
    }
}
