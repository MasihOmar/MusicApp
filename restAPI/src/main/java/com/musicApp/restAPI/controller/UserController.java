package com.musicApp.restAPI.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    // Get all users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserEntity> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get users: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserEntity user = userService.getUserById(id);
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserEntity user) {
        try {
            UserEntity updatedUser = userService.updateUser(id, user);
            if (updatedUser == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get user's playlists
    @GetMapping("/{id}/playlists")
    public ResponseEntity<?> getUserPlaylists(@PathVariable Long id) {
        try {
            List<PlaylistEntity> playlists = userService.getUserPlaylists(id);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get user playlists: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get user's favorite songs
    @GetMapping("/{id}/favorites")
    public ResponseEntity<?> getUserFavorites(@PathVariable Long id) {
        try {
            List<SongEntity> favorites = userService.getUserFavorites(id);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get user favorites: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Add song to favorites - RESTful approach with body instead of path variable
    @PostMapping("/{id}/favorites")
    public ResponseEntity<?> addToFavorites(@PathVariable Long id, @RequestBody FavoriteRequest request) {
        try {
            userService.addToFavorites(id, request.getSongId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Song added to favorites successfully");
            response.put("userId", id);
            response.put("songId", request.getSongId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add song to favorites: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Add multiple songs to favorites
    @PostMapping("/{id}/favorites/batch")
    public ResponseEntity<?> addMultipleToFavorites(@PathVariable Long id, @RequestBody List<Long> songIds) {
        try {
            Map<String, Object> response = new HashMap<>();
            int addedCount = 0;
            
            for (Long songId : songIds) {
                try {
                    userService.addToFavorites(id, songId);
                    addedCount++;
                } catch (Exception e) {
                    // Continue with other songs if one fails
                }
            }
            
            response.put("success", true);
            response.put("addedCount", addedCount);
            response.put("totalCount", songIds.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add songs to favorites: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Remove song from favorites - RESTful approach
    @DeleteMapping("/{id}/favorites")
    public ResponseEntity<?> removeFromFavorites(@PathVariable Long id, @RequestBody FavoriteRequest request) {
        try {
            userService.removeFromFavorites(id, request.getSongId());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Song removed from favorites successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to remove song from favorites: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Request object for favorite operations
    public static class FavoriteRequest {
        private Long songId;
        
        public Long getSongId() {
            return songId;
        }
        
        public void setSongId(Long songId) {
            this.songId = songId;
        }
    }
} 