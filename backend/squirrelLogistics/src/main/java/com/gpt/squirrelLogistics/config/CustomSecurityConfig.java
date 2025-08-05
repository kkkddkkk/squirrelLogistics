package com.gpt.squirrelLogistics.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Configuration
@EnableWebSecurity
@Log4j2
@RequiredArgsConstructor
public class CustomSecurityConfig {
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
		log.info("=========================== Security Config Start ===========================");
		httpSecurity.cors(httpSecurityConfigurer -> {
			httpSecurityConfigurer.configurationSource(corsSource());
		});
		
		//안전을 위한 세션 기반 인증 무효화 => 서블릿 기반 세션 사용 불가로 막기.
		httpSecurity.sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		
		//GET 이외의 Request 차단, CSRF 토큰 기반의 인증 사용 예정.
		httpSecurity.csrf(cstf -> cstf.disable());
		
		//formLogin: post 방식으로 'username'과 'password'라는 파라미터를 통해 로그인.
		httpSecurity.formLogin(con -> {
			con.loginPage("/api/member/login");
		});
		
		return httpSecurity.build();
	}
	
	@Bean
	public CorsConfigurationSource corsSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(Arrays.asList("*"));
		configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
		configuration.setAllowCredentials(true);
		
		UrlBasedCorsConfigurationSource  source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		
		return source;
	}
	
	//암호를 encoding 빈 => BCryptPas.
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
