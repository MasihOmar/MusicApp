package com.musicApp.restAPI.sql.resource;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    
    // Simple token storage (in a real app, use JWT)
    private final Map<String, Long> tokenUserMap = new HashMap<>();

    public AuthController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Find user by username (in a real app, use email or username)
            UserEntity user = userService.findUserByUsername(loginRequest.getEmail());
            
            if (user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword_hash())) {
                // Create token (in a real app, use JWT)
                String token = UUID.randomUUID().toString();
                tokenUserMap.put(token, user.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", userToDTO(user));
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Convert user to DTO to avoid sending password
    private Map<String, Object> userToDTO(UserEntity user) {
        Map<String, Object> userDTO = new HashMap<>();
        userDTO.put("id", user.getId());
        userDTO.put("username", user.getUsername());
        // Add other fields as needed, but not the password
        return userDTO;
    }
    
    // Login request object
    public static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public String getPassword() {
            return password;
        }
        
        public void setPassword(String password) {
            this.password = password;
        }
    }
} 