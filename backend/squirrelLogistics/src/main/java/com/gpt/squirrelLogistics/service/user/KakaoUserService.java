package com.gpt.squirrelLogistics.service.user;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.user.KakaoUserProfile;
import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KakaoUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Transactional
    public User findOrCreateFromKakao(KakaoUserProfile profile) {
        String kakaoId = "kakao_" + profile.getId();
        return userRepository.findByLoginId(kakaoId).orElseGet(() -> {
            User u = new User();
            u.setLoginId(kakaoId);
            u.setName(Optional.ofNullable(profile.getKakaoAccount())
                              .map(KakaoUserProfile.KakaoAccount::getProfile)
                              .map(KakaoUserProfile.KakaoAccount.Profile::getNickname)
                              .orElse("카카오사용자"));
            u.setEmail(Optional.ofNullable(profile.getKakaoAccount()).map(KakaoUserProfile.KakaoAccount::getEmail).orElse(null));
            u.setPassword("{noop}");
            u.setRole(UserRoleEnum.ETC);
            u.setRegDate(LocalDateTime.now());
            u.setSns_login(true);
            return userRepository.save(u);
        });
    }

    @Transactional
    public void updateLastLogin(Long userId) {
        userRepository.findById(userId).ifPresent(u -> {
            u.setLastLogin(LocalDateTime.now());
            userRepository.save(u);
        });
    }
}