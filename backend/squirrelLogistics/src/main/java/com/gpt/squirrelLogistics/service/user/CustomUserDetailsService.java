package com.gpt.squirrelLogistics.service.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        User u = userRepository.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자 없음: " + username));

        // 비밀번호: DB에 BCrypt로 저장되어 있어야 함
        return org.springframework.security.core.userdetails.User
                .withUsername(u.getLoginId())
                .password(u.getPassword())
                .roles(u.getRole().name())  // 예: ADMIN/DRIVER/COMPANY
                .build();
    }
}