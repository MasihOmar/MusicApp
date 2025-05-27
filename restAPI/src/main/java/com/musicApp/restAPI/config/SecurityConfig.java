package com.musicApp.restAPI.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final TokenAuthenticationFilter tokenAuthenticationFilter;

    public SecurityConfig(TokenAuthenticationFilter tokenAuthenticationFilter) {
        this.tokenAuthenticationFilter = tokenAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth ->
                // Allow health endpoints without authentication
                auth.requestMatchers("/v1/api/health/**").permitAll()
                
                // Allow test endpoints
                .requestMatchers("/v1/public/**").permitAll()
                
                // Allow Swagger/OpenAPI endpoints
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                
                // Public API endpoints - make sure these are accessible
                .requestMatchers("/v1/api/auth/**").permitAll()  // Allow all auth endpoints
                .requestMatchers("/api/auth/**").permitAll()     // Also allow non-v1 prefix for backward compatibility
                
                // Allow access to static resources
                .requestMatchers("/v1/static/**").permitAll()
                .requestMatchers("/v1/api/songs").permitAll()
                .requestMatchers("/v1/api/songs/*/stream").permitAll()
                .requestMatchers("/v1/api/songs/*/cover").permitAll()
                .requestMatchers("/v1/api/playlists").permitAll()
                
                // Require authentication for playback history endpoints
                .requestMatchers("/v1/api/playback-history/**").authenticated()
                
                // Require authentication for other endpoints
                .anyRequest().authenticated()
            )
            .addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Range"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Range", "Content-Length", "Content-Type", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 