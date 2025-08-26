package com.gpt.squirrelLogistics.service.user;

import org.springframework.security.core.token.TokenService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gpt.squirrelLogistics.entity.user.User;
import com.gpt.squirrelLogistics.repository.car.CarRepository;
import com.gpt.squirrelLogistics.repository.company.CompanyRepository;
import com.gpt.squirrelLogistics.repository.driver.DriverRepository;
import com.gpt.squirrelLogistics.repository.user.UserRepository;
import com.gpt.squirrelLogistics.repository.vehicleType.VehicleTypeRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FindUserByTokenService {


    private final UserRepository userRepo;

    public User getUserFromToken(String token) {
        // JWT 등으로 토큰 파싱
        Long userId = parseUserId(token);
        return userRepo.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private Long parseUserId(String token) {
        // JWT 라이브러리로 userId 추출
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor("very-secret-key-change-me-please-256bit!".getBytes())) // 키 길이 확인
                .build()
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
        Double uidDouble = Double.valueOf(claims.get("uid").toString());
        Long userId = uidDouble.longValue();

        return userId;
    }
    
    public Long getUserIdByToken(String token) {
    	return parseUserId(token);
    }
}
