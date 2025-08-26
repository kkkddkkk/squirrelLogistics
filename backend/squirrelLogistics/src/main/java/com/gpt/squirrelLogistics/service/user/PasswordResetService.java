package com.gpt.squirrelLogistics.service.user;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // 메모리에 토큰 저장: Map<토큰, TokenInfo>
    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();
    
    // 토큰 정보를 담는 내부 클래스
    private static class TokenInfo {
        private final String email;
        private final Long userId;
        private final LocalDateTime expiry;
        
        public TokenInfo(String email, Long userId, LocalDateTime expiry) {
            this.email = email;
            this.userId = userId;
            this.expiry = expiry;
        }
        
        public String getEmail() { return email; }
        public Long getUserId() { return userId; }
        public LocalDateTime getExpiry() { return expiry; }
        
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiry);
        }
    }
    
    /**
     * 비밀번호 재설정 토큰 생성 및 저장
     * @param email 사용자 이메일
     * @return 생성된 토큰 (실제로는 이메일로 전송되어야 함)
     */
    public String createPasswordResetToken(String email) {
        log.info("비밀번호 재설정 토큰 생성 요청 - email: {}", email);
        
        try {
            // 이메일로 사용자 조회
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("비밀번호 재설정 토큰 생성 실패 - 존재하지 않는 email: {}", email);
                return null;
            }
            
            User user = userOpt.get();
            
            // 기존 토큰이 있다면 제거
            tokenStore.entrySet().removeIf(entry -> 
                entry.getValue().getEmail().equals(email));
            
            // 새 토큰 생성 (UUID)
            String token = UUID.randomUUID().toString();
            
            // 토큰 정보 저장 (1시간 유효)
            TokenInfo tokenInfo = new TokenInfo(
                email, 
                user.getUserId(), 
                LocalDateTime.now().plusHours(1)
            );
            
            tokenStore.put(token, tokenInfo);
            
            log.info("비밀번호 재설정 토큰 생성 성공 - email: {}, userId: {}, token: {}, expiry: {}", 
                    email, user.getUserId(), token, tokenInfo.getExpiry());
            
            // 실제 이메일 전송 대신 로그에 출력 (개발자 확인용)
            log.info("=== 비밀번호 재설정 링크 ====");
            log.info("http://localhost:3000/company/reset-password?token={}", token);
            log.info("=============================");
            
            return token;
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 토큰 생성 중 오류 발생", e);
            return null;
        }
    }
    
    /**
     * 비밀번호 재설정 토큰 검증
     * @param token 재설정 토큰
     * @return 토큰이 유효하면 true, 아니면 false
     */
    public boolean validateToken(String token) {
        log.info("비밀번호 재설정 토큰 검증 - token: {}", token);
        
        try {
            if (token == null || token.trim().isEmpty()) {
                log.warn("토큰 검증 실패 - 토큰이 null이거나 비어있음");
                return false;
            }
            
            TokenInfo tokenInfo = tokenStore.get(token);
            if (tokenInfo == null) {
                log.warn("토큰 검증 실패 - 존재하지 않는 토큰: {}", token);
                log.info("현재 저장된 토큰 수: {}", tokenStore.size());
                return false;
            }
            
            if (tokenInfo.isExpired()) {
                log.warn("토큰 검증 실패 - 만료된 토큰: {}, expiry: {}", token, tokenInfo.getExpiry());
                // 만료된 토큰 제거
                tokenStore.remove(token);
                return false;
            }
            
            log.info("토큰 검증 성공 - email: {}, userId: {}, expiry: {}", 
                    tokenInfo.getEmail(), tokenInfo.getUserId(), tokenInfo.getExpiry());
            return true;
            
        } catch (Exception e) {
            log.error("토큰 검증 중 예외 발생 - token: {}, error: {}", token, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * 비밀번호 재설정
     * @param token 재설정 토큰
     * @param newPassword 새 비밀번호
     * @return 재설정 성공 여부
     */
    public boolean resetPassword(String token, String newPassword) {
        log.info("비밀번호 재설정 시도 - token: {}, newPassword: {}자", token, newPassword.length());
        
        try {
            // 토큰 검증
            if (!validateToken(token)) {
                return false;
            }
            
            TokenInfo tokenInfo = tokenStore.get(token);
            Long userId = tokenInfo.getUserId();
            
            // 사용자 조회
            var userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                log.warn("비밀번호 재설정 실패 - 사용자를 찾을 수 없음: userId: {}", userId);
                return false;
            }
            
            User user = userOpt.get();
            
            // 새 비밀번호로 업데이트 (BCrypt 해시)
            String hashedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(hashedPassword);
            userRepository.save(user);
            
            // 사용된 토큰 제거
            tokenStore.remove(token);
            
            log.info("비밀번호 재설정 성공 - userId: {}, email: {}", userId, tokenInfo.getEmail());
            return true;
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 중 오류 발생", e);
            return false;
        }
    }
    
    /**
     * 만료된 토큰 정리 (정기적으로 호출)
     */
    public void cleanupExpiredTokens() {
        int beforeSize = tokenStore.size();
        tokenStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
        int afterSize = tokenStore.size();
        
        if (beforeSize != afterSize) {
            log.info("만료된 토큰 정리 완료 - {}개 제거됨", beforeSize - afterSize);
        }
    }
    
    /**
     * 현재 저장된 토큰 정보 조회 (관리자용)
     */
    public Map<String, Object> getTokenInfo(String token) {
        TokenInfo tokenInfo = tokenStore.get(token);
        if (tokenInfo == null) {
            return Map.of("valid", false, "message", "토큰이 존재하지 않습니다.");
        }
        
        return Map.of(
            "valid", !tokenInfo.isExpired(),
            "email", tokenInfo.getEmail(),
            "userId", tokenInfo.getUserId(),
            "expiry", tokenInfo.getExpiry(),
            "expired", tokenInfo.isExpired()
        );
    }
}
