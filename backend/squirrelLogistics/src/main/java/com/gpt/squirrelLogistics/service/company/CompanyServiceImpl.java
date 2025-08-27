package com.gpt.squirrelLogistics.service.company;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gpt.squirrelLogistics.dto.company.CompanyMyPageResponseDTO;
import com.gpt.squirrelLogistics.dto.company.CompanyResponseDTO;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class CompanyServiceImpl implements CompanyService {
    
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 본인인증 (아이디/비밀번호 확인)
     * User 테이블에서 loginId와 password가 일치하는지 확인
     */
    @Override
    public boolean verifyCredentials(String loginId, String password) {
        log.info("본인인증 시도 - loginId: '{}'", loginId);
        
        try {
            // loginId로 User 조회
            Optional<User> userOpt = userRepository.findByLoginId(loginId);
            if (userOpt.isEmpty()) {
                log.warn("본인인증 실패 - 존재하지 않는 loginId: '{}'", loginId);
                return false;
            }
            
            User user = userOpt.get();
            log.info("사용자 조회 성공 - userId: {}, name: '{}', loginId: '{}', email: '{}'", 
                    user.getUserId(), user.getName(), user.getLoginId(), user.getEmail());
            
            // 비밀번호 확인
            boolean passwordMatch = passwordEncoder.matches(password, user.getPassword());
            if (!passwordMatch) {
                log.warn("본인인증 실패 - 비밀번호 불일치, loginId: '{}'", loginId);
                return false;
            }
            
            log.info("본인인증 성공 - userId: {}, name: '{}', email: '{}'", user.getUserId(), user.getName(), user.getEmail());
            return true;
            
        } catch (Exception e) {
            log.error("본인인증 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 비밀번호 재설정 링크 요청
     * 이메일로 가입된 계정이 있는지 확인하고 재설정 토큰 생성
     */
    @Override
    public String requestPasswordReset(String email) {
        try {
            log.info("비밀번호 재설정 요청 - email: '{}'", email);
            
            // 이메일로 사용자 찾기
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("비밀번호 재설정 실패 - 해당 이메일로 가입된 사용자 없음: '{}'", email);
                return null;
            }
            
            User user = userOpt.get();
            log.info("사용자 조회 성공 - userId: {}, name: '{}', email: '{}'", 
                    user.getUserId(), user.getName(), user.getEmail());
            
            // 비밀번호 재설정 토큰 생성 (UUID)
            String resetToken = java.util.UUID.randomUUID().toString();
            
            // 토큰을 User 엔티티의 password 필드에 임시 저장 (엔티티 수정 없이)
            // 형식: "RESET_TOKEN:UUID:만료시간"
            long expiryTime = System.currentTimeMillis() + (30 * 60 * 1000); // 30분 후 만료
            String tokenWithExpiry = "RESET_TOKEN:" + resetToken + ":" + expiryTime;
            
            // 임시 토큰을 password 필드에 저장
            user.setPassword(tokenWithExpiry);
            userRepository.save(user);
            
            log.info("비밀번호 재설정 토큰 생성 완료 - userId: {}, email: '{}', resetToken: '{}', 만료시간: {}", 
                    user.getUserId(), email, resetToken, new java.util.Date(expiryTime));
            
            // 백엔드 로그에 재설정 링크 출력 (개발용)
            String resetLink = String.format("http://localhost:3000/company/reset-password?token=%s&email=%s", 
                    resetToken, email);
            log.info("=== 비밀번호 재설정 링크 (개발용) ===");
            log.info("링크: {}", resetLink);
            log.info("토큰: {}", resetToken);
            log.info("만료시간: {}", new java.util.Date(expiryTime));
            log.info("=====================================");
            
            return resetToken;
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 요청 실패 - email: '{}'", email, e);
            return null;
        }
    }
    
    /**
     * 비밀번호 재설정 완료 (토큰으로 새 비밀번호 설정)
     */
    public boolean completePasswordReset(String email, String newPassword) {
        try {
            log.info("비밀번호 재설정 완료 시도 - email: '{}'", email);
            
            // 이메일로 사용자 찾기
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                log.warn("비밀번호 재설정 실패 - 해당 이메일로 가입된 사용자 없음: '{}'", email);
                return false;
            }
            
            User user = userOpt.get();
            
            // 새 비밀번호 유효성 검사
            if (newPassword == null || newPassword.trim().isEmpty() || newPassword.length() < 4) {
                log.warn("비밀번호 재설정 실패 - 유효하지 않은 새 비밀번호: '{}'", newPassword);
                return false;
            }
            
            // 새 비밀번호 해시화하여 저장 (DB 업데이트)
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            log.info("비밀번호 재설정 완료 - userId: {}, email: '{}', 새 비밀번호 길이: {}", 
                    user.getUserId(), email, newPassword.length());
            return true;
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 완료 실패 - email: '{}'", email, e);
            return false;
        }
    }
    
    /**
     * 비밀번호 재설정 토큰 검증
     * DB에서 해당 토큰을 가진 사용자를 찾고 만료시간을 확인
     */
    @Override
    public boolean validateResetToken(String token) {
        try {
            log.info("토큰 검증 시도 - token: {}", token);
            
            if (token == null || token.trim().isEmpty()) {
                log.warn("토큰 검증 실패 - 토큰이 null이거나 비어있음");
                return false;
            }
            
            // DB에서 해당 토큰을 가진 사용자 찾기
            // password 필드에 "RESET_TOKEN:UUID:만료시간" 형식으로 저장되어 있음
            List<User> allUsers = userRepository.findAll();
            for (User user : allUsers) {
                String storedPassword = user.getPassword();
                if (storedPassword != null && storedPassword.startsWith("RESET_TOKEN:")) {
                    String[] parts = storedPassword.split(":");
                    if (parts.length == 3 && parts[1].equals(token)) {
                        // 토큰 일치, 만료시간 확인
                        long expiryTime = Long.parseLong(parts[2]);
                        long currentTime = System.currentTimeMillis();
                        
                        if (currentTime < expiryTime) {
                            log.info("토큰 검증 성공 - userId: {}, email: '{}', 만료시간: {}", 
                                    user.getUserId(), user.getEmail(), new java.util.Date(expiryTime));
                            return true;
                        } else {
                            log.warn("토큰 만료됨 - userId: {}, email: '{}', 만료시간: {}, 현재시간: {}", 
                                    user.getUserId(), user.getEmail(), new java.util.Date(expiryTime), new java.util.Date(currentTime));
                            // 만료된 토큰 제거
                            user.setPassword(null);
                            userRepository.save(user);
                            return false;
                        }
                    }
                }
            }
            
            log.warn("토큰 검증 실패 - 해당 토큰을 가진 사용자를 찾을 수 없음: {}", token);
            return false;
            
        } catch (Exception e) {
            log.error("토큰 검증 중 오류 발생", e);
            return false;
        }
    }

    @Override
    public CompanyResponseDTO getCompanyByUserId(Long userId) {
        try {
            // userId로 User 조회
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return null;
            }
            
            // User의 Company 조회
            Company company = user.getCompany();
            if (company == null) {
                return null;
            }
            
            // CompanyResponseDTO로 변환
            return CompanyResponseDTO.builder()
                .companyId(company.getCompanyId())
                .address(company.getAddress())
                .mainLoca(company.getMainLoca())
                .build();
                
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    @Override
    @Transactional
    public String saveMainAddress(Long companyId, String mainLoca) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            company.setMainLoca(mainLoca);
            companyRepository.save(company);
            
            return "기본 주소가 저장되었습니다: " + mainLoca;
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 저장 실패: " + e.getMessage());
        }
    }
    
    @Override
    public String getMainAddress(Long companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            return company.getMainLoca();
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 조회 실패: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public String deleteMainAddress(Long companyId) {
        try {
            Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
            
            company.setMainLoca(null);
            companyRepository.save(company);
            
            return "기본 주소가 삭제되었습니다.";
        } catch (Exception e) {
            throw new RuntimeException("기본 주소 삭제 실패: " + e.getMessage());
        }
    }
}
