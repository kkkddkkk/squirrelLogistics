package com.gpt.squirrelLogistics.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.gpt.squirrelLogistics.config.user.JwtAuthFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthFilter jwtAuthFilter;

	@Bean
	public CorsConfigurationSource corsSource() {
		CorsConfiguration cors = new CorsConfiguration();
		cors.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "*")); // 필요시 정확히 지정
		cors.setAllowedMethods(Arrays.asList("OPTIONS", "HEAD", "GET", "POST", "PUT", "PATCH", "DELETE")); // ✅ OPTIONS
																											// 포함
		cors.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
		cors.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", cors);
		return source;
	}

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.cors(c -> c.configurationSource(corsSource())) // ✅ CORS 활성화
				.csrf(csrf -> csrf.disable())
				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						// ✅ 모든 프리플라이트 허용
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// ✅ 공개 엔드포인트 (로그인, 회원가입, 메타, 차량종류, 중복확인, 기사 관련 등)
						.requestMatchers("/api/auth/login", "/api/auth/register/**", "/api/public/**",
								"/api/vehicle-types/**", "/api/auth/exists/**", "/api/driver/**", "/error", "/oauth/kakao/**", "/api/auth/oauth/google" // 스프링 기본 에러 페이지 허용 (의외로 필요한 경우
																							// 있음)
						).permitAll()
						// 드라이버 측 요청 확인.
						.requestMatchers("/api/delivery/requests/**","/api/delivery/assignments/**", "/api/delivery/proposals/**").permitAll()

						// 그 외는 인증 필요
						.anyRequest().authenticated())
				// 401/403 명확히 구분해서 응답
				.exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
					res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
					res.setContentType("application/json;charset=UTF-8");
					res.getWriter().write("{\"error\":\"Unauthorized\"}");
				}).accessDeniedHandler((req, res, e) -> {
					res.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
					res.setContentType("application/json;charset=UTF-8");
					res.getWriter().write("{\"error\":\"Access Denied\"}");
				})).addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
		return cfg.getAuthenticationManager();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
