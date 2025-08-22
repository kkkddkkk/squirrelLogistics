package com.gpt.squirrelLogistics.controller.driver;

import com.gpt.squirrelLogistics.config.user.JwtTokenProvider;
import com.gpt.squirrelLogistics.dto.driver.DriverResponseDTO;
import com.gpt.squirrelLogistics.dto.regist.RegisterDriverRequest;
import com.gpt.squirrelLogistics.entity.driver.Driver;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.service.driver.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Claims;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;


@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@Log4j2
public class DriverController {

    private final DriverService driverService;
    private final JwtTokenProvider jwtTokenProvider;
    private final DriverRepository driverRepository;

    // JWT 토큰에서 userId 추출하는 공통 메서드
    private Long extractUserIdFromToken(String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Jws<Claims> claims = jwtTokenProvider.parse(token);
            Object uidObj = claims.getBody().get("uid");
            
            log.info("JWT에서 추출된 uid 원본: {} (타입: {})", uidObj, uidObj != null ? uidObj.getClass().getSimpleName() : "null");
            
            if (uidObj instanceof Integer) {
                return ((Integer) uidObj).longValue();
            } else if (uidObj instanceof Long) {
                return (Long) uidObj;
            } else if (uidObj instanceof Double) {
                return ((Double) uidObj).longValue();
            } else if (uidObj instanceof String) {
                String uidStr = (String) uidObj;
                // "65.0" 같은 형태를 "65"로 변환
                if (uidStr.contains(".")) {
                    uidStr = uidStr.substring(0, uidStr.indexOf("."));
                }
                return Long.valueOf(uidStr);
            } else {
                String uidStr = uidObj.toString();
                // "65.0" 같은 형태를 "65"로 변환
                if (uidStr.contains(".")) {
                    uidStr = uidStr.substring(0, uidStr.indexOf("."));
                }
                return Long.valueOf(uidStr);
            }
        } catch (Exception e) {
            log.error("JWT 토큰에서 userId 추출 실패: {}", e.getMessage(), e);
            throw new IllegalArgumentException("토큰에서 사용자 ID를 추출할 수 없습니다.");
        }
    }

    // 기사 프로필 조회 (accessToken에서 userId 추출)
    @GetMapping("/profile")
    public ResponseEntity<DriverResponseDTO> getDriverProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            log.info("받은 Authorization 헤더: {}", authHeader);
            
            Long userId = extractUserIdFromToken(authHeader);
            log.info("JWT에서 추출된 userId: {}", userId);
            
            DriverResponseDTO response = driverService.getDriverProfile(userId);
            log.info("조회된 DriverResponseDTO: {}", response);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("기사 프로필 조회 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("기사 프로필 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 기사 프로필 수정
    @PutMapping("/profile")
    public ResponseEntity<DriverResponseDTO> updateDriverProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody RegisterDriverRequest request) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            DriverResponseDTO response = driverService.updateDriverProfile(userId, request);
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
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("image") MultipartFile image) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            // 파일 크기 체크 (10MB 제한)
            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("파일 크기는 10MB를 초과할 수 없습니다.");
            }
            
            // 파일 타입 체크
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("이미지 파일만 업로드 가능합니다.");
            }
            
            String imageUrl = driverService.uploadProfileImage(userId, image);
            return ResponseEntity.ok(imageUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("프로필 이미지 업로드 실패", e);
            return ResponseEntity.internalServerError().body("이미지 업로드에 실패했습니다.");
        }
    }

    // 프로필 이미지 삭제
    @DeleteMapping("/profile/image")
    public ResponseEntity<Void> deleteProfileImage(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            driverService.deleteProfileImage(userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("프로필 이미지 삭제 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 비밀번호 확인 (프로필 수정 전)
    @PostMapping("/auth/verify-password")
    public ResponseEntity<Boolean> verifyPassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("password") String password) {
        try {
            log.info("비밀번호 확인 요청 - Authorization: {}", authHeader);
            log.info("요청된 비밀번호: {}", password);
            Long userId = extractUserIdFromToken(authHeader);
            log.info("추출된 userId: {}", userId);
            
            boolean isValid = driverService.verifyPassword(userId, password);
            log.info("비밀번호 확인 결과: {}", isValid);
            return ResponseEntity.ok(isValid);
        } catch (IllegalArgumentException e) {
            log.error("비밀번호 확인 실패 - IllegalArgumentException: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("비밀번호 확인 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 비밀번호 변경
    @PutMapping("/auth/password")
    public ResponseEntity<Void> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("currentPassword") String currentPassword,
            @RequestParam("newPassword") String newPassword) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            driverService.changePassword(userId, currentPassword, newPassword);
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
    public ResponseEntity<Void> deleteAccount(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            driverService.deleteAccount(userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("계정 탈퇴 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // 테스트용 더미 데이터 생성
    @PostMapping("/test/create-dummy")
    public ResponseEntity<String> createDummyDriver() {
        try {
            driverService.createDummyDriver();
            return ResponseEntity.ok("더미 기사 데이터가 생성되었습니다.");
        } catch (Exception e) {
            log.error("더미 데이터 생성 실패", e);
            return ResponseEntity.internalServerError().body("더미 데이터 생성에 실패했습니다.");
        }
    }

}
