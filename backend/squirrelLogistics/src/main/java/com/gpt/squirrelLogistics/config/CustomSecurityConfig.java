package com.gpt.squirrelLogistics.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.gpt.squirrelLogistics.config.user.JwtAuthFilter;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

/*
 * API 서버는 외부에서 Ajax 로 호출되기 대문에, 기존의 JSP 서버 방식과는 차이가 많음.
 * 스프링 Secure 는 기본적으로 다른 도메인에서 Ajax 호출을 차단함.
 * 때문에 이를 위한 CORS 설정과 GET 방식외의 호출 시에 CSRF 공격을 막기 위한 설정이 기본적으로
 * 활성화 되어 있으므로 이를 변경해주고 개발 해야함.
 * 
 * 이 설정클래스는 이를 적용한 클래스이고, 추가적으로 인증에 관련된 모듈도 추가함.
 */
//@Configuration
//@Log4j2
//@RequiredArgsConstructor
////메서드별 권한 설정해보기 : PreAuthorize 를 이용해서 각 경로에 특정한 권한을 가진 사용자만 접근이 가능하도록 제어 할 수 있음
////여기에 어노테이션을 설정하고, 메서드 선언부에 이를 적용하는 방식을 이용ㅇ함.
//@EnableMethodSecurity
public class CustomSecurityConfig {
//
//	@Bean
//	// 위 설정이 적용된 빈을 리턴하는 메서드 정의
//	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//		log.info("-------------------------- Security Config------------------------");
//
//		// cors 설정..
//		http.cors(httpSecurityCorsConfigurer -> {
//			httpSecurityCorsConfigurer.configurationSource(corsSource());
//		});
//
//		// 세션 기반 인증을 무효화 하기 위한 설정 추가..이렇게 하면 서블릿 기반의 세션인증은 사용 불가함.
//		// 만약 사용하려면 이걸 삭제하면 됨.
//		http.sessionManagement(sessionConf -> sessionConf.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
//
//		// 이번엔 GET 방식을 제외하고는 CSRF 토큰(우리가 배울것..) 을 기반으로 인증/인가 처리를 함.
//		// 때문에 이 설정도 추가 해야함.
//		http.csrf(csrf -> csrf.disable());
//
//		// formLogin 설정을 추가하면, 스프링시큐어는 post 방식으로
//		// username 과 password 라는 파라미터를 통해서 로그인을 처리 할수 있도록 함.
////		http.formLogin(con -> {
////			con.loginPage("/api/member/login");
////			//로그인이 완료되면 등록된 핸들러로 핸들링 하도록 설정
////			con.successHandler(new APILoginSuccessHandler());
////			//로긴 실패시 실패 핸들러를 통한 메세지 전송 처리
////			con.failureHandler(new APILoginFailHandler());
////		});
////		
////		http.addFilterBefore(new JWTCheckerFilter(), UsernamePasswordAuthenticationFilter.class);
////		
////		http.exceptionHandling(config -> config.accessDeniedHandler(new CustomAccessDenieHandler()));
//		return http.build();
//	}
//
//	@Bean
//	public CorsConfigurationSource corsSource() {
//		CorsConfiguration corsConfiguration = new CorsConfiguration();
//
//		corsConfiguration.setAllowedOriginPatterns(Arrays.asList("*"));
//		corsConfiguration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE"));
//		corsConfiguration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
//		corsConfiguration.setAllowCredentials(true);
//
//		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//
//		source.registerCorsConfiguration("/**", corsConfiguration);
//
//		return source;
//	}
//
//	// 암호를 암호화 해주는 빈 등록.
//	// SpringBoot 에서는 BCryptPas..... 라는 빈을 기본적으로 제고 해준다.
//	// 얘를 기본 암호화 설정 모듈로 등록 해서 사용한다.
//	@Bean
//	public BCryptPasswordEncoder passwordEncoder() {
//		return new BCryptPasswordEncoder();
//	}
//
//	private final JwtAuthFilter jwtAuthFilter;
//
//	@Bean
//	SecurityFilterChain filter(HttpSecurity http) throws Exception {
//		http.csrf(csrf -> csrf.disable())
//				.sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//				.authorizeHttpRequests(
//						auth -> auth.requestMatchers("/api/auth/login", "/api/public/**", "/api/vehicle-types/**")
//								.permitAll().anyRequest().authenticated())
//				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
//		return http.build();
//	}
}
