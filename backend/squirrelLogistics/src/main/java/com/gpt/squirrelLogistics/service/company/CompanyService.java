package com.gpt.squirrelLogistics.service.company;

import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.dto.company.CompanyMyPageResponseDTO;
import com.gpt.squirrelLogistics.dto.delivery.DeliveryListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
    
    /**
     * 회사별 배송 목록 조회 (필터링 및 페이징 지원)
     * @param companyId 회사 ID
     * @param name 기사명 (선택적)  // driverName → name
     * @param status 배송 상태 (선택적)  // deliveryStatus → status
     * @param pageable 페이징 정보
     * @return 배송 목록 (페이징)
     */
    Page<DeliveryListResponseDTO> getCompanyDeliveriesWithFilters(
        Long companyId, 
        String name, 
        String status, 
        Pageable pageable
    );
    
    /**
     * 비밀번호 재설정 완료
     * @param email 이메일 주소
     * @param newPassword 새 비밀번호
     * @return 성공 여부
     */
    boolean completePasswordReset(String email, String newPassword);
    
    /**
     * 회원탈퇴 (사용자 정보 완전 삭제)
     * @param userId 사용자 ID
     * @return 성공 여부
     */
    boolean deleteUserAccount(Long userId);

    /**
     * 회원탈퇴 (role을 ETC로 변경)
     * @param userId 사용자 ID
     * @return 성공 여부
     */
    boolean withdrawAccount(Long userId);
}
