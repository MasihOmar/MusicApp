package com.musicApp.restAPI.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Add static resource handlers for music and cover art
        registry.addResourceHandler("/static/music/**")
                .addResourceLocations("classpath:/static/music/")
                .setCachePeriod(3600)
                .resourceChain(true);
        
        registry.addResourceHandler("/static/covers/**")
                .addResourceLocations("classpath:/static/covers/")
                .setCachePeriod(3600)
                .resourceChain(true);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Disposition", "Content-Range", "Content-Length", "Content-Type")
                .allowCredentials(true);
    }
} 