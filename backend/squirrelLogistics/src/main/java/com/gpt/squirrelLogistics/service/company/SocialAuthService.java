package com.gpt.squirrelLogistics.service.company;

import com.gpt.squirrelLogistics.dto.company.SocialReauthRequestDTO;
import com.gpt.squirrelLogistics.dto.company.SocialReauthResponseDTO;

public interface SocialAuthService {

    /**
     * 소셜 재인증 가능 여부 확인
     * @return 재인증 가능 여부
     */
    boolean canPerformSocialReauth();

    /**
     * 소셜 재인증 검증
     * @param request 재인증 요청 정보
     * @return 재인증 결과
     */
    SocialReauthResponseDTO verifySocialReauth(SocialReauthRequestDTO request);

    /**
     * 소셜 인증 콜백 처리
     * @param code OAuth 인증 코드
     * @param state 상태 정보
     * @param provider 제공자
     * @return 콜백 처리 결과
     */
    SocialReauthResponseDTO handleSocialCallback(String code, String state, String provider);

    /**
     * 소셜 재인증 완료 처리
     * @param provider 제공자 (google, kakao)
     * @param email 사용자 이메일
     * @param token 인증 토큰
     * @return 재인증 완료 여부
     */
    boolean completeSocialReauth(String provider, String email, String token);
}
