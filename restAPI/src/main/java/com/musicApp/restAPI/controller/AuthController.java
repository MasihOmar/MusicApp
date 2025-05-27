package com.musicApp.restAPI.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.service.UserService;
import com.musicApp.restAPI.config.TokenService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    
    @Autowired
    public AuthController(UserService userService, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserEntity user) {
        try {
            // Validate required fields
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (user.getPassword_hash() == null || user.getPassword_hash().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
            }

            // Check if user already exists
            UserEntity existingUser = userService.findUserByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
            }

            // Set the password hash before creating the user
            user.setPassword_hash(passwordEncoder.encode(user.getPassword_hash()));
            UserEntity registeredUser = userService.createUser(user);
            
            // Create token for immediate login
            String token = tokenService.createToken(registeredUser.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", token);
            response.put("user", userToDTO(registeredUser));
            
            return ResponseEntity.ok()
                .header("Authorization", "Bearer " + token)
                .body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("Received login request for email: " + loginRequest.getEmail());
            
            // Validate request
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                System.out.println("Login failed: Email is required");
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            if (loginRequest.getPassword() == null || loginRequest.getPassword().trim().isEmpty()) {
                System.out.println("Login failed: Password is required");
                return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            }

            // Find user by email
            UserEntity user = userService.findUserByEmail(loginRequest.getEmail());
            
            if (user == null) {
                System.out.println("Login failed: User not found for email: " + loginRequest.getEmail());
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword_hash())) {
                System.out.println("Login failed: Invalid password for user: " + user.getEmail());
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
            
            // Create token
            String token = tokenService.createToken(user.getId());
            System.out.println("Login successful for user: " + user.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userToDTO(user));
            
            return ResponseEntity.ok()
                .header("Authorization", "Bearer " + token)
                .body(response);
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            tokenService.removeToken(token);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header (Bearer token)
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Long userId = tokenService.validateToken(token);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
            }
            
            UserEntity user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            return ResponseEntity.ok(userToDTO(user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from Authorization header (Bearer token)
            String oldToken = authHeader.substring(7); // Remove "Bearer " prefix
            Long userId = tokenService.validateToken(oldToken);
            
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
            }
            
            // Remove old token
            tokenService.removeToken(oldToken);
            
            // Create new token
            String newToken = tokenService.createToken(userId);
            
            UserEntity user = userService.getUserById(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", newToken);
            response.put("user", userToDTO(user));
            
            return ResponseEntity.ok()
                .header("Authorization", "Bearer " + newToken)
                .body(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Convert user to DTO to avoid sending password
    private Map<String, Object> userToDTO(UserEntity user) {
        Map<String, Object> userDTO = new HashMap<>();
        userDTO.put("id", user.getId());
        userDTO.put("username", user.getUsername());
        userDTO.put("email", user.getEmail());
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