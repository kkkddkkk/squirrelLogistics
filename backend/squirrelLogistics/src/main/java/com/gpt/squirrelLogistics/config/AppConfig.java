package com.gpt.squirrelLogistics.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.modelmapper.spi.MatchingStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig implements WebMvcConfigurer {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
		.allowedOrigins("http://localhost:3000")
		.allowedMethods("*");
	}
<<<<<<< Updated upstream
=======
	
	@Bean ModelMapper getMapper() {
		ModelMapper modelMapper = new ModelMapper();
		modelMapper.getConfiguration().setFieldMatchingEnabled(true)
		.setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE)
		.setMatchingStrategy(MatchingStrategies.LOOSE);
		
		return modelMapper;
	}
}
>>>>>>> Stashed changes
	
	@Bean
	public ModelMapper modelMapper() {
		return new ModelMapper();
	}
}
