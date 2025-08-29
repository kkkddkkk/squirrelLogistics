package com.gpt.squirrelLogistics.controller.company;

import com.gpt.squirrelLogistics.dto.company.SocialReauthRequestDTO;
import com.gpt.squirrelLogistics.dto.company.SocialReauthResponseDTO;
import com.gpt.squirrelLogistics.service.company.SocialAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/api/company/social")
@RequiredArgsConstructor
@Log4j2
public class SocialAuthController {

    private final SocialAuthService socialAuthService;

    /**
     * 소셜 재인증 상태 확인
     * @return 소셜 재인증 가능 여부
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSocialReauthStatus() {
        try {
            log.info("=== 소셜 재인증 상태 확인 시작 ===");
            
            boolean canReauth = socialAuthService.canPerformSocialReauth();
            
            Map<String, Object> response = Map.of(
                "canReauth", canReauth,
                "message", canReauth ? "소셜 재인증이 가능합니다." : "소셜 재인증이 불가능합니다."
            );
            
            log.info("소셜 재인증 상태 확인 완료: {}", response);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("소셜 재인증 상태 확인 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "소셜 재인증 상태 확인 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 소셜 재인증 완료 처리
     * @param request 소셜 재인증 요청 정보
     * @return 재인증 결과
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifySocialReauth(@RequestBody SocialReauthRequestDTO request) {
        try {
            log.info("=== 소셜 재인증 시작 - provider: {} ===", request.getProvider());
            
            SocialReauthResponseDTO response = socialAuthService.verifySocialReauth(request);
            
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "소셜 재인증이 완료되었습니다.",
                "data", response
            );
            
            log.info("소셜 재인증 완료: {}", response);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("소셜 재인증 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "소셜 재인증 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 소셜 재인증 완료 처리 (프론트엔드에서 호출)
     * @param request 소셜 재인증 완료 요청
     * @return 재인증 완료 결과
     */
    @PostMapping("/reauth/complete")
    public ResponseEntity<Map<String, Object>> completeSocialReauth(@RequestBody Map<String, String> request) {
        try {
            String provider = request.get("provider");
            String email = request.get("email");
            String token = request.get("token");
            
            log.info("=== 소셜 재인증 완료 처리 - provider: {}, email: {} ===", provider, email);
            
            if (provider == null || email == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "message", "필수 파라미터가 누락되었습니다."
                ));
            }
            
            // 소셜 재인증 완료 처리
            boolean success = socialAuthService.completeSocialReauth(provider, email, token);
            
            if (success) {
                log.info("소셜 재인증 완료 성공 - provider: {}, email: {}", provider, email);
                return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "message", "소셜 재인증이 완료되었습니다.",
                    "provider", provider
                ));
            } else {
                log.warn("소셜 재인증 완료 실패 - provider: {}, email: {}", provider, email);
                return ResponseEntity.ok(Map.of(
                    "ok", false,
                    "message", "소셜 재인증 처리에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("소셜 재인증 완료 처리 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "ok", false,
                "message", "소셜 재인증 처리 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 소셜 재인증 콜백 처리 (프론트엔드로 리다이렉트)
     * @param code OAuth 인증 코드
     * @param state 상태 정보
     * @param provider 제공자 (google, kakao)
     * @return 프론트엔드로 리다이렉트
     */
    @GetMapping("/callback")
    public RedirectView handleSocialCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "provider", required = false) String provider) {
        try {
            log.info("=== 소셜 인증 콜백 처리 - provider: {}, code: {} ===", provider, code);
            
            // provider가 없는 경우 state에서 추출 시도
            if (provider == null && state != null) {
                try {
                    // state가 JSON 형태인 경우 provider 추출
                    if (state.contains("provider")) {
                        // 간단한 파싱 (실제로는 더 안전한 방법 사용 권장)
                        if (state.contains("google")) {
                            provider = "google";
                        } else if (state.contains("kakao")) {
                            provider = "kakao";
                        }
                    }
                } catch (Exception e) {
                    log.warn("state에서 provider 추출 실패: {}", e.getMessage());
                }
            }
            
            // 기본값 설정
            if (provider == null) {
                provider = "unknown";
            }
            
            // 프론트엔드로 리다이렉트 (쿼리 파라미터 포함)
            String redirectUrl = String.format(
                "http://localhost:3000/company/oauth/success?code=%s&provider=%s&state=%s",
                code,
                provider,
                state != null ? state : ""
            );
            
            log.info("프론트엔드로 리다이렉트: {}", redirectUrl);
            return new RedirectView(redirectUrl);
            
        } catch (Exception e) {
            log.error("소셜 인증 콜백 처리 실패: {}", e.getMessage(), e);
            // 에러 시에도 프론트엔드로 리다이렉트 (에러 파라미터 포함)
            String errorRedirectUrl = String.format(
                "http://localhost:3000/company/oauth/success?error=auth_failed&provider=%s",
                provider != null ? provider : "unknown"
            );
            return new RedirectView(errorRedirectUrl);
        }
    }
}
