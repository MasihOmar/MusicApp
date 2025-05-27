package com.musicApp.restAPI.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Arrays;

@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final List<String> publicEndpoints = Arrays.asList(
        "/api/auth/login", 
        "/api/auth/register", 
        "/api/health/ping",
        "/api/songs/*/stream",
        "/api/songs/*/cover",
        "/v1/api/interactions",
        "/public/test",
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/v3/api-docs",
        "/swagger-ui.html",
        "/swagger-resources/**",
        "/webjars/**",
        "/v1/api/songs",
        "/v1/api/playlists"
    );

    public TokenAuthenticationFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip authentication for public endpoints
        String requestPath = request.getRequestURI();
        
        System.out.println("Processing request: " + requestPath);
        
        // Remove v1 prefix for endpoint matching
        String pathToCheck = requestPath;
        if (requestPath.startsWith("/v1")) {
            pathToCheck = requestPath.substring(3);
        }
        
        // Skip token check for public endpoints
        if (isPublicEndpoint(pathToCheck)) {
            System.out.println("Public endpoint detected, skipping authentication: " + requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Long userId = tokenService.validateToken(token);
            
            if (userId != null) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("User authenticated with ID: " + userId);
            } else {
                System.out.println("Invalid token presented");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        } else {
            System.out.println("No Authorization header found or not Bearer token");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private boolean isPublicEndpoint(String requestPath) {
        // Remove v1 prefix for endpoint matching
        final String pathToCheck = requestPath.startsWith("/v1") ? requestPath.substring(3) : requestPath;
        
        return publicEndpoints.stream()
            .anyMatch(pattern -> {
                if (pattern.contains("*")) {
                    String prefix = pattern.substring(0, pattern.indexOf("*"));
                    String suffix = pattern.substring(pattern.indexOf("*") + 1);
                    return pathToCheck.startsWith(prefix) && pathToCheck.endsWith(suffix);
                }
                return pattern.equals(pathToCheck) || 
                       pathToCheck.startsWith("/public/") ||
                       pathToCheck.startsWith("/swagger-ui/") ||
                       pathToCheck.startsWith("/v3/api-docs/");
            });
    }
} 