package com.musicApp.restAPI.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${music.storage.song-dir:${user.home}/MusicApp/songs/}")
    private String songDir;
    
    @Value("${music.storage.cover-dir:${user.home}/MusicApp/coverArt/}")
    private String coverDir;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Add file:// prefix for local file system access
        registry.addResourceHandler("/api/music/stream/**")
                .addResourceLocations("file:" + songDir);
        
        registry.addResourceHandler("/api/music/cover/**")
                .addResourceLocations("file:" + coverDir);
    }

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer
            .setUseSuffixPatternMatch(false)
            .setUseTrailingSlashMatch(true)
            .addPathPrefix("/v1", c -> 
                c.getPackage().getName().contains("controller") && 
                !c.getSimpleName().equals("HealthController")
            );
    }
} 