package com.gpt.squirrelLogistics.controller.driver;

import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import com.gpt.squirrelLogistics.service.driver.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@Log4j2
public class DriverController {

    private final DriverService driverService;

    // 기사 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<DriverResponseDTO> getDriverProfile(@RequestParam Long driverId) {
        try {
            DriverResponseDTO response = driverService.getDriverProfile(driverId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("기사 프로필 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 기사 프로필 수정
    @PutMapping("/profile")
    public ResponseEntity<DriverResponseDTO> updateDriverProfile(
            @RequestParam Long driverId,
            @RequestBody RegisterDriverRequest request) {
        try {
            DriverResponseDTO response = driverService.updateDriverProfile(driverId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("기사 프로필 수정 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 프로필 이미지 업로드
    @PostMapping("/profile/image")
    public ResponseEntity<String> uploadProfileImage(
            @RequestParam Long driverId,
            @RequestParam("image") MultipartFile image) {
        try {
            // 파일 크기 체크 (10MB 제한)
            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("파일 크기는 10MB를 초과할 수 없습니다.");
            }
            
            // 파일 타입 체크
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("이미지 파일만 업로드 가능합니다.");
            }
            
            String imageUrl = driverService.uploadProfileImage(driverId, image);
            return ResponseEntity.ok(imageUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("프로필 이미지 업로드 실패", e);
            return ResponseEntity.internalServerError().body("이미지 업로드에 실패했습니다.");
        }
    }

    // 비밀번호 확인 (프로필 수정 전)
    @PostMapping("/auth/verify-password")
    public ResponseEntity<Boolean> verifyPassword(
            @RequestParam Long driverId,
            @RequestParam String password) {
        try {
            boolean isValid = driverService.verifyPassword(driverId, password);
            return ResponseEntity.ok(isValid);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("비밀번호 확인 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 비밀번호 변경
    @PutMapping("/auth/password")
    public ResponseEntity<Void> changePassword(
            @RequestParam Long driverId,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        try {
            driverService.changePassword(driverId, currentPassword, newPassword);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("비밀번호 변경 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 계정 탈퇴
    @DeleteMapping("/auth/account")
    public ResponseEntity<Void> deleteAccount(@RequestParam Long driverId) {
        try {
            driverService.deleteAccount(driverId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("계정 탈퇴 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // TODO: 긴급 신고 기능은 추후 구현 예정
    // @PostMapping("/emergency/report")
    // public ResponseEntity<Void> submitEmergencyReport(@RequestBody EmergencyReportRequest request) {
    //     // TODO: 긴급 신고 처리
    //     return ResponseEntity.ok().build();
    // }
} 