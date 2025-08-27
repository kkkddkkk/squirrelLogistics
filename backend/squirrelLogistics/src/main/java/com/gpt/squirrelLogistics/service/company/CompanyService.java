package com.gpt.squirrelLogistics.service.company;

import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.dto.company.CompanyMyPageResponseDTO;

public interface CompanyService {
    
    /**
     * 본인인증 (아이디/비밀번호 확인)
     * @param loginId 로그인 ID
     * @param password 비밀번호
     * @return 인증 성공 여부
     */
    boolean verifyCredentials(String loginId, String password);
    
    /**
     * 비밀번호 재설정 링크 요청
     * @param email 이메일 주소
     * @return 재설정 토큰 (성공 시) 또는 null (실패 시)
     */
    String requestPasswordReset(String email);
    
    /**
     * 비밀번호 재설정 토큰 검증
     * @param token 재설정 토큰
     * @return 토큰 유효성
     */
    boolean validateResetToken(String token);
    
    /**
     * userId로부터 companyId 조회
     */
    CompanyResponseDTO getCompanyByUserId(Long userId);
    
    /**
     * 회사 기본 주소 저장 (main_loca)
     */
    String saveMainAddress(Long companyId, String mainLoca);
    
    /**
     * 회사 기본 주소 조회
     */
    String getMainAddress(Long companyId);
    
    /**
     * 회사 기본 주소 삭제
     */
    String deleteMainAddress(Long companyId);
}
