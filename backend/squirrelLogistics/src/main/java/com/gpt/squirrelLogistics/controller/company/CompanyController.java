package com.gpt.squirrelLogistics.controller.company;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.dto.company.CompanyMyPageResponseDTO;
import com.gpt.squirrelLogistics.dto.delivery.DeliveryListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.gpt.squirrelLogistics.service.company.CompanyService;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
@Log4j2
@CrossOrigin(origins = "*")
public class CompanyController {
    
    private final CompanyService companyService;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 본인인증 (아이디/비밀번호 확인)
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyCredentials(@RequestBody Map<String, String> request) {
        try {
            String loginId = request.get("loginId");
            String password = request.get("password");
            
            log.info("본인인증 요청 - loginId: '{}'", loginId);
            
            if (loginId == null || loginId.trim().isEmpty() || 
                password == null || password.trim().isEmpty()) {
                log.warn("본인인증 실패 - 필수 파라미터 누락: loginId='{}'", loginId);
                return ResponseEntity.badRequest().body(Map.of("error", "아이디와 비밀번호를 모두 입력해주세요."));
            }
            
            boolean isValid = companyService.verifyCredentials(loginId.trim(), password.trim());
            
            if (isValid) {
                log.info("본인인증 성공 - loginId: '{}'", loginId);
                return ResponseEntity.ok(Map.of("ok", true, "message", "본인인증이 완료되었습니다."));
            } else {
                log.warn("본인인증 실패 - 인증 정보 불일치: loginId: '{}'", loginId);
                return ResponseEntity.ok(Map.of("ok", false, "message", "아이디 또는 비밀번호가 일치하지 않습니다."));
            }
        } catch (Exception e) {
            log.error("본인인증 실패", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "인증 중 오류가 발생했습니다."));
        }
    }

    /**
     * 소셜 사용자 본인인증 상태 확인
     */
    @GetMapping("/verify/status")
    public ResponseEntity<Map<String, Object>> checkVerificationStatus() {
        try {
            log.info("=== 소셜 사용자 본인인증 상태 확인 시작 ===");
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            
            // 소셜 로그인 여부 확인
            boolean isSocialUser = user.isSns_login();
            log.info("사용자 정보 - userId: {}, name: {}, sns_login: {}", 
                    user.getUserId(), user.getName(), isSocialUser);
            
            if (!isSocialUser) {
                log.warn("로컬 사용자 - 본인인증 필요");
                return ResponseEntity.ok(Map.of("isSocialUser", false, "message", "로컬 사용자는 본인인증이 필요합니다."));
            }
            
            // 소셜 사용자인 경우 회원정보 보유 여부 확인
            Company company = companyRepository.findByUserId(user.getUserId()).orElse(null);
            
            boolean hasProfileInfo = !!(user.getPnumber() != null || user.getAccount() != null || user.getBusinessN() != null || 
                                     (company != null && company.getAddress() != null));
            
            log.info("소셜 사용자 회원정보 확인 - hasProfileInfo: {}", hasProfileInfo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isSocialUser", true);
            response.put("hasProfileInfo", hasProfileInfo);
            response.put("message", hasProfileInfo ? "소셜 재인증이 필요합니다." : "본인인증 없이 수정 가능합니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("=== 소셜 사용자 본인인증 상태 확인 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 소셜 사용자 재인증 완료 처리
     */
    @PostMapping("/verify/social/complete")
    public ResponseEntity<Map<String, Object>> completeSocialVerification(@RequestBody Map<String, String> request) {
        try {
            log.info("=== 소셜 사용자 재인증 완료 처리 시작 ===");
            
            String provider = request.get("provider"); // "google" 또는 "kakao"
            String email = request.get("email");
            
            log.info("소셜 재인증 완료 - provider: {}, email: {}", provider, email);
            
            if (provider == null || email == null) {
                log.warn("필수 파라미터 누락 - provider: {}, email: {}", provider, email);
                return ResponseEntity.badRequest().body(Map.of("error", "필수 파라미터가 누락되었습니다."));
            }
            
            // 이메일로 사용자 확인
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
            
            // 소셜 로그인 사용자인지 확인
            if (!user.isSns_login()) {
                log.warn("로컬 사용자 - 소셜 재인증 불가: {}", email);
                return ResponseEntity.badRequest().body(Map.of("error", "소셜 로그인 사용자가 아닙니다."));
            }
            
            // 소셜 재인증 완료 처리
            boolean success = companyService.completeSocialVerification(user.getUserId(), provider);
            
            if (success) {
                log.info("소셜 재인증 완료 성공 - userId: {}, provider: {}", user.getUserId(), provider);
                return ResponseEntity.ok(Map.of(
                    "ok", true, 
                    "message", "소셜 재인증이 완료되었습니다.",
                    "userId", user.getUserId(),
                    "provider", provider
                ));
            } else {
                log.warn("소셜 재인증 완료 실패 - userId: {}, provider: {}", user.getUserId(), provider);
                return ResponseEntity.ok(Map.of("ok", false, "message", "소셜 재인증 처리에 실패했습니다."));
            }
            
        } catch (Exception e) {
            log.error("=== 소셜 사용자 재인증 완료 처리 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 비밀번호 재설정 링크 요청
     */
    @PostMapping("/password/reset/request")
    public ResponseEntity<Map<String, Object>> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            log.info("=== 비밀번호 재설정 요청 시작 ===");
            log.info("요청 데이터: {}", request);
            
            String email = request.get("email");
            log.info("추출된 이메일: '{}'", email);
            
            if (email == null || email.trim().isEmpty()) {
                log.warn("이메일이 null이거나 비어있음");
                return ResponseEntity.badRequest().body(Map.of("error", "이메일 주소를 입력해주세요."));
            }
            
            log.info("이메일 유효성 검사 통과, 서비스 호출 시작");
            String resetToken = companyService.requestPasswordReset(email);
            
            if (resetToken != null) {
                log.info("비밀번호 재설정 요청 성공 - email: '{}', token: '{}'", email, resetToken);
                
                // 프론트엔드에서 팝업으로 열 수 있도록 토큰과 링크 정보 포함
                Map<String, Object> response = new HashMap<>();
                response.put("ok", true);
                response.put("message", "비밀번호 재설정이 준비되었습니다. 팝업 창에서 새 비밀번호를 입력하세요.");
                response.put("resetUrl", "/company/reset-password");
                response.put("email", email);
                response.put("token", resetToken);
                
                return ResponseEntity.ok(response);
            } else {
                log.warn("비밀번호 재설정 요청 실패 - 해당 이메일로 가입된 계정 없음: '{}'", email);
                return ResponseEntity.ok(Map.of("ok", false, "message", "해당 이메일로 가입된 계정을 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            log.error("=== 비밀번호 재설정 요청 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "비밀번호 재설정 요청 중 오류가 발생했습니다."));
        }
    }

    /**
     * 비밀번호 재설정 토큰 검증
     */
    @GetMapping("/password/reset/validate/{token}")
    public ResponseEntity<Map<String, Object>> validateResetToken(@PathVariable("token") String token) {
        try {
            log.info("토큰 검증 요청 - token: {}", token);
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "토큰이 제공되지 않았습니다."));
            }
            
            // 간단한 토큰 검증 (실제로는 더 복잡한 검증 로직 필요)
            boolean isValid = companyService.validateResetToken(token);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("valid", true, "message", "유효한 토큰입니다."));
            } else {
                return ResponseEntity.ok(Map.of("valid", false, "message", "유효하지 않거나 만료된 토큰입니다."));
            }
        } catch (Exception e) {
            log.error("토큰 검증 중 오류 발생", e);
            return ResponseEntity.internalServerError().body(Map.of("valid", false, "error", "토큰 검증 중 오류가 발생했습니다."));
        }
    }

    /**
     * 비밀번호 재설정 완료 (토큰으로 새 비밀번호 설정)
     */
    @PostMapping("/password/reset/complete")
    public ResponseEntity<Map<String, Object>> completePasswordReset(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            if (email == null || email.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "이메일과 새 비밀번호를 입력해주세요."));
            }
            
            // CompanyService의 completePasswordReset 메서드 호출
            boolean success = companyService.completePasswordReset(email, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of("ok", true, "message", "비밀번호가 성공적으로 재설정되었습니다."));
            } else {
                return ResponseEntity.ok(Map.of("ok", false, "message", "비밀번호 재설정에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("비밀번호 재설정 완료 실패", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "비밀번호 재설정 중 오류가 발생했습니다."));
        }
    }

    /**
     * 간단한 테스트 API
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of("message", "Company API 정상 작동"));
    }
    
    /**
     * 비밀번호 재설정 테스트 API (공개 접근 확인용)
     */
    @GetMapping("/password/reset/test")
    public ResponseEntity<Map<String, Object>> testPasswordResetAccess() {
        return ResponseEntity.ok(Map.of("message", "비밀번호 재설정 엔드포인트 공개 접근 가능"));
    }
    
    /**
     * 현재 로그인한 사용자의 Company 정보 조회 (JWT 토큰 기반)
     */
    @GetMapping("/current-user")
    public ResponseEntity<Object> getCurrentUserCompany() {
        try {
            log.info("=== 현재 사용자 Company 정보 조회 시작 ===");
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            log.info("User 조회 성공 - userId: {}, name: {}", user.getUserId(), user.getName());
            
            // userId로 Company 조회
            Company company = companyRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found for userId: " + user.getUserId()));
            log.info("Company 조회 성공 - companyId: {}, address: {}", company.getCompanyId(), company.getAddress());
            
            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("companyId", company.getCompanyId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("address", company.getAddress());
            response.put("mainLoca", company.getMainLoca());
            
            log.info("현재 사용자 Company 정보 조회 성공 - userId: {}, companyId: {}", user.getUserId(), company.getCompanyId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("=== 현재 사용자 Company 정보 조회 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 기본 주소 저장 (간단한 방식)
     */
    @PostMapping("/save-address")
    public ResponseEntity<Map<String, Object>> saveAddress(@RequestBody Map<String, Object> request) {
        try {
            // null 체크 및 안전한 파싱
            Object companyIdObj = request.get("companyId");
            Object addressObj = request.get("address");
            Object typeObj = request.get("type");
            
            if (companyIdObj == null || addressObj == null || typeObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "필수 파라미터가 누락되었습니다"));
            }
            
            Long companyId = Long.parseLong(companyIdObj.toString());
            String address = addressObj.toString();
            String type = typeObj.toString(); // START, END, WAYPOINT
            
            // Company의 mainLoca에 저장 (간단한 방식)
            String result = companyService.saveMainAddress(companyId, address);
            return ResponseEntity.ok(Map.of("SUCCESS", result != null ? result : "저장 완료"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "잘못된 companyId 형식입니다"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 기본 주소 조회 (간단한 방식)
     */
    @GetMapping("/get-address/{companyId}")
    public ResponseEntity<Map<String, Object>> getAddress(@PathVariable("companyId") Long companyId) {
        try {
            String mainLoca = companyService.getMainAddress(companyId);
            // null 체크를 통한 안전한 응답
            Map<String, Object> response = new HashMap<>();
            response.put("mainLoca", mainLoca != null ? mainLoca : "");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 회원정보 수정
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> request) {
        try {
            log.info("=== 회원정보 수정 요청 시작 ===");
            log.info("요청 데이터: {}", request);
            
            // 요청 데이터 추출 (선택적 수정 지원)
            String email = (String) request.get("email");
            String pnumber = (String) request.get("pnumber");
            String businessN = (String) request.get("businessN");
            String account = (String) request.get("account");
            String address = (String) request.get("address");
            String password = (String) request.get("password");
            
            // 최소 하나의 필드는 수정되어야 함
            if ((email == null || email.trim().isEmpty()) && 
                (pnumber == null || pnumber.trim().isEmpty()) && 
                (businessN == null || businessN.trim().isEmpty()) && 
                (account == null || account.trim().isEmpty()) && 
                (address == null || address.trim().isEmpty()) && 
                (password == null || password.trim().isEmpty())) {
                log.warn("회원정보 수정 실패 - 수정할 내용이 없음");
                return ResponseEntity.badRequest().body(Map.of("error", "수정할 내용이 없습니다. 하나 이상의 필드를 수정해주세요."));
            }
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            log.info("User 조회 성공 - userId: {}, name: {}", user.getUserId(), user.getName());
            
            // userId로 Company 조회
            Company company = companyRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found for userId: " + user.getUserId()));
            log.info("Company 조회 성공 - companyId: {}, address: {}", company.getCompanyId(), company.getAddress());
            
            // User 정보 업데이트 (제공된 필드만 선택적으로 업데이트)
            if (email != null && !email.trim().isEmpty()) {
                user.setEmail(email);
                log.info("이메일 업데이트: {}", email);
            }
            if (pnumber != null && !pnumber.trim().isEmpty()) {
                user.setPnumber(pnumber); // Entity의 Pnumber (대문자 P)
                log.info("연락처 업데이트: {}", pnumber);
            }
            if (businessN != null && !businessN.trim().isEmpty()) {
                user.setBusinessN(businessN); // Entity의 businessN
                log.info("사업자등록번호 업데이트: {}", businessN);
            }
            if (account != null && !account.trim().isEmpty()) {
                user.setAccount(account); // Entity의 account
                log.info("계좌번호 업데이트: {}", account);
            }
            
            // 비밀번호가 제공된 경우 업데이트 (소셜 사용자 제외)
            if (password != null && !password.trim().isEmpty()) {
                // 소셜 사용자인 경우 비밀번호 수정 제한
                if (user.isSns_login()) {
                    log.warn("소셜 사용자 비밀번호 수정 시도 - userId: {}", user.getUserId());
                    return ResponseEntity.badRequest().body(Map.of("error", "소셜 로그인 사용자는 비밀번호를 이 페이지에서 수정할 수 없습니다."));
                }
                user.setPassword(passwordEncoder.encode(password));
                log.info("비밀번호 업데이트 완료");
            }
            
            userRepository.save(user);
            log.info("User 정보 업데이트 완료");
            
            // Company 정보 업데이트 (제공된 경우에만)
            if (address != null && !address.trim().isEmpty()) {
                company.setAddress(address);
                log.info("주소 업데이트: {}", address);
                companyRepository.save(company);
                log.info("Company 정보 업데이트 완료");
            }
            
            log.info("=== 회원정보 수정 완료 ===");
            return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "회원정보가 성공적으로 수정되었습니다."
            ));
            
        } catch (Exception e) {
            log.error("=== 회원정보 수정 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 마이페이지 회원정보 조회 (JWT 토큰 기반 인증)
     * @return CompanyMyPageResponseDTO
     */
    @GetMapping("/mypage")
    public ResponseEntity<Object> getMyPageInfo() {
        try {
            log.info("=== 마이페이지 정보 조회 시작 ===");
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            
            // sns_login 값 강제 확인
            boolean snsLoginValue = user.isSns_login();
            log.info("User 조회 성공 - userId: {}, name: {}, sns_login: {} (직접 확인: {})", 
                    user.getUserId(), user.getName(), user.isSns_login(), snsLoginValue);
            
            // sns_login이 true인 경우 추가 로그
            if (snsLoginValue) {
                log.info("🔍 소셜 로그인 사용자 확인됨 - loginId: {}", user.getLoginId());
            }
            
            // userId로 Company 조회 (소셜 사용자는 company 정보가 없을 수 있음)
            log.info("CompanyRepository.findByUserId() 호출 시작");
            Company company = companyRepository.findByUserId(user.getUserId())
                .orElse(null); // 소셜 사용자는 company 정보가 없을 수 있음
            
            if (company != null) {
                log.info("Company 조회 성공 - companyId: {}, address: {}", company.getCompanyId(), company.getAddress());
            } else {
                log.info("Company 정보 없음 - 소셜 로그인 사용자일 수 있음");
            }
            
            // CompanyMyPageResponseDTO로 변환
            CompanyMyPageResponseDTO myPageInfo = CompanyMyPageResponseDTO.builder()
                .userId(user.getUserId())
                .loginId(user.getLoginId())
                .name(user.getName())
                .email(user.getEmail())
                .Pnumber(user.getPnumber())  // Entity의 Pnumber -> DTO의 pnumber
                .account(user.getAccount())
                .businessN(user.getBusinessN())
                .companyId(company != null ? company.getCompanyId() : null)
                .address(company != null ? company.getAddress() : null)
                .mainLoca(company != null ? company.getMainLoca() : null)
                .build();
            
            if (myPageInfo != null) {
                log.info("마이페이지 정보 조회 성공 - name: {}, email: {}, sns_login: {}", 
                        myPageInfo.getName(), myPageInfo.getEmail(), user.isSns_login());
                
                // 소셜 사용자 구분을 위한 응답 구조
                Map<String, Object> response = new HashMap<>();
                response.put("userInfo", myPageInfo);
                response.put("sns_login", snsLoginValue); // 강제 확인된 값 사용
                
                log.info("응답 데이터 구조 - userInfo: {}, sns_login: {} (직접 확인: {})", 
                        myPageInfo != null ? "존재함" : "null", user.isSns_login(), snsLoginValue);
                
                // 응답 데이터 전체 로그
                log.info("🔍 최종 응답 데이터: {}", response);
                
                return ResponseEntity.ok(response);
            } else {
                log.warn("마이페이지 정보를 찾을 수 없음 - userId: {}", user.getUserId());
                return ResponseEntity.status(404).body(Map.of("error", "마이페이지 정보를 찾을 수 없습니다"));
            }
            
        } catch (Exception e) {
            log.error("=== 마이페이지 정보 조회 실패 ===", e);
            log.error("에러 타입: {}", e.getClass().getSimpleName());
            log.error("에러 메시지: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("원인: {}", e.getCause().getMessage());
            }
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 회사의 배송 목록 조회 (필터링 및 페이징 지원)
     * - driverName → name
     * - estimatedFee → payAmount (DTO/쿼리에서 반영됨)
     * - deliveryStatus → status (DTO/쿼리에서 반영됨)
     */
    @GetMapping("/deliveries")
    public ResponseEntity<Object> getCompanyDeliveries(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "5") int size) {
        try {
            log.info("=== 회사 배송 목록 조회 시작 ===");
            log.info("필터 - name: {}, status: {}, page: {}, size: {}", name, status, page, size);
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            log.info("User 조회 성공 - userId: {}, name: {}", user.getUserId(), user.getName());
            
            // userId로 Company 조회
            Company company = companyRepository.findByUserId(user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found for userId: " + user.getUserId()));
            log.info("Company 조회 성공 - companyId: {}", company.getCompanyId());
            
            // 페이징 정보 생성
            Pageable pageable = PageRequest.of(page, size);
            
            // Service를 통해 배송 목록 조회
            Page<DeliveryListResponseDTO> deliveriesPage = companyService
                    .getCompanyDeliveriesWithFilters(company.getCompanyId(), name, status, pageable);
            
            log.info("=== 회사 배송 목록 조회 완료 - 총 건수: {}, 현재 페이지 건수: {} ===", 
                    deliveriesPage.getTotalElements(), deliveriesPage.getContent().size());
            
            return ResponseEntity.ok(Map.of(
                "deliveries", deliveriesPage.getContent(),
                "totalCount", deliveriesPage.getTotalElements(),
                "currentPage", deliveriesPage.getNumber(),
                "totalPages", deliveriesPage.getTotalPages(),
                "hasNext", deliveriesPage.hasNext(),
                "hasPrevious", deliveriesPage.hasPrevious()
            ));
            
        } catch (Exception e) {
            log.error("=== 회사 배송 목록 조회 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 회원탈퇴 (사용자 정보 완전 삭제)
     */
    @DeleteMapping("/account/delete")
    public ResponseEntity<Map<String, Object>> deleteUserAccount() {
        try {
            log.info("=== 회원탈퇴 요청 시작 ===");
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            log.info("User 조회 성공 - userId: {}, name: {}", user.getUserId(), user.getName());
            
            // 회원탈퇴 실행
            boolean isDeleted = companyService.deleteUserAccount(user.getUserId());
            
            if (isDeleted) {
                log.info("=== 회원탈퇴 완료 성공 - userId: {} ===", user.getUserId());
                return ResponseEntity.ok(Map.of(
                    "ok", true, 
                    "message", "회원탈퇴가 완료되었습니다."
                ));
            } else {
                log.warn("=== 회원탈퇴 실패 - userId: {} ===", user.getUserId());
                return ResponseEntity.ok(Map.of(
                    "ok", false, 
                    "message", "회원탈퇴에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            log.error("=== 회원탈퇴 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 회원탈퇴 (role을 ETC로 변경)
     */
    @PostMapping("/withdraw")
    public ResponseEntity<Map<String, Object>> withdrawAccount() {
        try {
            log.info("=== 회원탈퇴 요청 시작 ===");
            
            // JWT 토큰에서 userId 추출
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("인증되지 않은 사용자");
                return ResponseEntity.status(401).body(Map.of("error", "인증되지 않은 사용자입니다"));
            }
            
            String username = auth.getName();
            log.info("인증된 사용자: {}", username);
            
            // username으로 User 조회
            User user = userRepository.findByLoginId(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with loginId: " + username));
            
            Long userId = user.getUserId();
            log.info("회원탈퇴 요청 - userId: {}", userId);
            
            boolean success = companyService.withdrawAccount(userId);
            
            if (success) {
                log.info("=== 회원탈퇴 완료 성공 - userId: {} ===", userId);
                return ResponseEntity.ok(Map.of("ok", true, "message", "회원탈퇴가 완료되었습니다."));
            } else {
                log.warn("=== 회원탈퇴 실패 - userId: {} ===", userId);
                return ResponseEntity.ok(Map.of("ok", false, "message", "회원탈퇴 처리에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("=== 회원탈퇴 실패 ===", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "회원탈퇴 처리 중 오류가 발생했습니다."));
        }
    }
}
