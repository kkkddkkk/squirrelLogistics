package com.gpt.squirrelLogistics.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.modelmapper.spi.MatchingStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.gpt.squirrelLogistics.service.housekeeping.HousekeepingInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class AppConfig implements WebMvcConfigurer {
	
	private final HousekeepingInterceptor interceptor;
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
		.allowedOrigins("http://localhost:3000")
		.allowedMethods("*");
	}
	
	@Bean ModelMapper getMapper() {
		ModelMapper modelMapper = new ModelMapper();
		modelMapper.getConfiguration().setFieldMatchingEnabled(true)
		.setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
		.setMatchingStrategy(MatchingStrategies.LOOSE);
		
		return modelMapper;
	}
	

	//작성자: 고은설.
	//기능: 운송 요청, 운송 할당 관련 api 엔드포인트 호출 시 최신 상태값 반영을 위한 sweeper호출.
	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(interceptor)
		.addPathPatterns(
				"/api/delivery/requests/**", 
				"/api/delivery/assignments/**", 
				"/api/delivery/proposals/**")
		.excludePathPatterns("/api/delivery/proposals/*/accept");
	}
}
	

