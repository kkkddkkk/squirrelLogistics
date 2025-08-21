package com.gpt.squirrelLogistics.service.driver;

import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import org.springframework.web.multipart.MultipartFile;

public interface DriverService {
    
    /**
     * 기사 프로필 조회 (userId로 조회)
     */
    DriverResponseDTO getDriverProfile(Long userId);
    
    /**
     * 기사 프로필 수정
     */
    DriverResponseDTO updateDriverProfile(Long userId, RegisterDriverRequest request);
    
    /**
     * 기사 비밀번호 변경
     */
    void changePassword(Long userId, String currentPassword, String newPassword);
    
    /**
     * 기사 계정 탈퇴
     */
    void deleteAccount(Long userId);
    
    /**
     * 비밀번호 확인
     */
    boolean verifyPassword(Long userId, String password);
    
    /**
     * 프로필 이미지 업로드
     */
    String uploadProfileImage(Long userId, MultipartFile image);
    
    /**
     * 프로필 이미지 삭제
     */
    void deleteProfileImage(Long userId);
    
    /**
     * 테스트용 더미 데이터 생성
     */
    void createDummyDriver();
}
