package com.gpt.squirrelLogistics.service.deliveryRequest;

import java.nio.file.AccessDeniedException;

import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.enums.user.UserRoleEnum;
import com.gpt.squirrelLogistics.service.user.FindUserByTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverTokenValidService {

	private final FindUserByTokenService tokenService;

	// 드라이버 아이디 리턴.
	public Long getDriverIdByToken(String token) throws AccessDeniedException {
		User user = tokenService.getUserFromToken(token);

		// 권한 확인
		if (user.getRole() == null || !user.getRole().equals(UserRoleEnum.DRIVER)) {
			throw new AccessDeniedException("User is not a driver");
		}

		// 드라이버 객체 확인
		if (user.getDriver() == null) {
			throw new IllegalStateException("Driver entity not found for user");
		}

		return user.getDriver().getDriverId();
	}
}
