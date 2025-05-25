package com.musicApp.restAPI.sql.resource;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
public class UserController {

    private final UserService userService;
    private final Map<String, Long> tokenUserMap = new HashMap<>();

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping(value = "/users")
    public List<UserEntity> getAllUsers(){
        return this.userService.getAllUsers();
    }

    @GetMapping(value = "/users/{id}")
    public UserEntity findUserById(@PathVariable Long id){
        return this.userService.findUserById(id);
    }

    @PostMapping(value = "/users/add")
    public ResponseEntity<?> addUser(@RequestBody RegistrationRequest registrationRequest) {
        try {
            // Check if username already exists
            UserEntity existingUser = userService.findUserByUsername(registrationRequest.getUsername());
            if (existingUser != null) {
                return ResponseEntity.status(409).body(Map.of("error", "Username already exists"));
            }
            
            // Create a new user entity
            UserEntity user = new UserEntity();
            user.setUsername(registrationRequest.getUsername());
            user.setPassword_hash(registrationRequest.getPassword());
            
            // Save the user
            UserEntity savedUser = userService.addUser(user);
            
            // Create token
            String token = UUID.randomUUID().toString();
            tokenUserMap.put(token, savedUser.getId());
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            
            Map<String, Object> userDTO = new HashMap<>();
            userDTO.put("id", savedUser.getId());
            userDTO.put("username", savedUser.getUsername());
            response.put("user", userDTO);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/users/update/{id}")
    public void updateUser(@PathVariable Long id, @RequestBody UserEntity user){
        this.userService.updateUser(id, user);
    }

    @DeleteMapping(value = "/users/delete/{id}")
    public void deleteUser(@PathVariable Long id){
        this.userService.deleteUser(id);
    }
    
    // Registration request object
    public static class RegistrationRequest {
        private String email;
        private String password;
        private String username;
        private String displayName;
        
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
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }
    }
}
