package com.gpt.squirrelLogistics.service.user;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.dto.user.KakaoUserProfile;
import com.gpt.squirrelLogistics.entity.company.Company;
import com.gpt.squirrelLogistics.entity.driver.Driver;
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
	public User findOrCreateFromKakao(KakaoUserProfile profile, UserRoleEnum desiredRole) {
		String kakaoId = "kakao_" + profile.getId();

		return userRepository.findByLoginId(kakaoId).map(existing -> {
			// ✅ 기존 유저가 ETC면 절대 승격하지 않음
			// 컨트롤러가 최종 차단하도록 그대로 반환(또는 여기서 예외 throw도 가능)
			return existing;
		}).orElseGet(() -> {
			// 신규 생성
			User u = new User();
			u.setLoginId(kakaoId);
			u.setName(Optional.ofNullable(profile.getKakaoAccount()).map(KakaoUserProfile.KakaoAccount::getProfile)
					.map(KakaoUserProfile.KakaoAccount.Profile::getNickname).orElse("카카오사용자"));
			u.setEmail(Optional.ofNullable(profile.getKakaoAccount()).map(KakaoUserProfile.KakaoAccount::getEmail)
					.orElse(null));
			u.setPassword("{noop}");
			// desiredRole 이 null/ETC라면 컨트롤러에서 이미 403으로 막고 오게 설계하는 게 안전
			u.setRole(desiredRole != null ? desiredRole : UserRoleEnum.ETC);
			u.setRegDate(LocalDateTime.now());
			u.setSns_login(true);

			if (desiredRole == UserRoleEnum.COMPANY) {
				Company c = new Company();
				c.setUser(u);
				u.setCompany(c);
			} else if (desiredRole == UserRoleEnum.DRIVER) {
				Driver d = new Driver();
				d.setUser(u);
				u.setDriver(d);
			}

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