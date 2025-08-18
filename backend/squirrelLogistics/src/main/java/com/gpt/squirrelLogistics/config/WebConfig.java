package com.gpt.squirrelLogistics.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프로필 이미지 서빙을 위한 리소스 핸들러
        registry.addResourceHandler("/api/images/profile/**")
                .addResourceLocations("file:uploads/profile/");
    }
} 