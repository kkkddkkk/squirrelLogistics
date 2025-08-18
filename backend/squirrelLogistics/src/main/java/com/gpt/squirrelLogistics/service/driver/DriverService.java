package com.gpt.squirrelLogistics.service.driver;

import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import org.springframework.web.multipart.MultipartFile;

public interface DriverService {
    
    /**
     * 기사 프로필 조회
     */
    DriverResponseDTO getDriverProfile(Long driverId);
    
    /**
     * 기사 프로필 수정
     * 아이디는 변경할 수 없음
     */
    DriverResponseDTO updateDriverProfile(Long driverId, RegisterDriverRequest request);
    
    /**
     * 기사 비밀번호 변경
     */
    void changePassword(Long driverId, String currentPassword, String newPassword);
    
    /**
     * 기사 계정 탈퇴
     */
    void deleteAccount(Long driverId);
    
    /**
     * 비밀번호 확인
     */
    boolean verifyPassword(Long driverId, String password);
    
    /**
     * 프로필 이미지 업로드
     */
    String uploadProfileImage(Long driverId, MultipartFile image);
} 