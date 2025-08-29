package com.gpt.squirrelLogistics.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialReauthResponseDTO {
    
    /**
     * 재인증 성공 여부
     */
    private boolean success;
    
    /**
     * 사용자 ID
     */
    private Long userId;
    
    /**
     * 소셜 로그인 제공자
     */
    private String provider;
    
    /**
     * 사용자 이메일
     */
    private String email;
    
    /**
     * 사용자 이름
     */
    private String name;
    
    /**
     * 재인증 완료 시간
     */
    private String reauthCompletedAt;
    
    /**
     * 메시지
     */
    private String message;
}
