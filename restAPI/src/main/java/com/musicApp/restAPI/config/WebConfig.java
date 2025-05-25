package com.musicApp.restAPI.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/music/stream/**")
                .addResourceLocations("classpath:/static/music/");
        
        registry.addResourceHandler("/api/music/cover/**")
                .addResourceLocations("classpath:/static/covers/");
    }
} 