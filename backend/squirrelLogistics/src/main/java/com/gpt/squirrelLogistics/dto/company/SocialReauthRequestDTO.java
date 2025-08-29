package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialReauthRequestDTO {
    
    /**
     * 소셜 로그인 제공자 (google, kakao)
     */
    private String provider;
    
    /**
     * OAuth 인증 코드
     */
    private String code;
    
    /**
     * 상태 정보 (CSRF 방지용)
     */
    private String state;
    
    /**
     * 사용자 ID (JWT에서 추출)
     */
    private Long userId;
}
