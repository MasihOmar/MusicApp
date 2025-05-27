package com.musicApp.restAPI.config;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import java.time.Instant;

@Service
public class TokenService {
    
    private final Map<String, TokenInfo> tokenUserMap = new ConcurrentHashMap<>();
    
    private static class TokenInfo {
        final Long userId;
        final Instant expirationTime;
        
        TokenInfo(Long userId) {
            this.userId = userId;
            // Token expires after 24 hours
            this.expirationTime = Instant.now().plusSeconds(24 * 60 * 60);
        }
        
        boolean isExpired() {
            return Instant.now().isAfter(expirationTime);
        }
    }
    
    public String createToken(Long userId) {
        String token = UUID.randomUUID().toString();
        tokenUserMap.put(token, new TokenInfo(userId));
        return token;
    }
    
    public Long validateToken(String token) {
        TokenInfo tokenInfo = tokenUserMap.get(token);
        if (tokenInfo == null || tokenInfo.isExpired()) {
            if (tokenInfo != null) {
                tokenUserMap.remove(token);
            }
            return null;
        }
        return tokenInfo.userId;
    }
    
    public void removeToken(String token) {
        tokenUserMap.remove(token);
    }
} 