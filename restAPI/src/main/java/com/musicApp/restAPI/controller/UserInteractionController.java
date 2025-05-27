package com.musicApp.restAPI.controller;

import com.musicApp.restAPI.model.UserSongInteraction;
import com.musicApp.restAPI.repository.UserSongInteractionRepository;
import com.musicApp.restAPI.sql.persistance.User.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/api/interactions")
public class UserInteractionController {
    
    @Autowired
    private UserSongInteractionRepository interactionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<?> recordInteraction(@RequestBody Map<String, Object> interactionData) {
        try {
            // Get user ID from authentication context
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Unauthorized",
                    "message", "User not authenticated"
                ));
            }
            
            // Create new interaction
            UserSongInteraction interaction = new UserSongInteraction();
            
            // Set required fields
            interaction.setUserId(userId);
            interaction.setSongId(((Number) interactionData.get("songId")).longValue());
            
            // Set interaction flags
            interaction.setPlayed((Boolean) interactionData.getOrDefault("played", false));
            interaction.setCompleted((Boolean) interactionData.getOrDefault("completed", false));
            interaction.setSkipped((Boolean) interactionData.getOrDefault("skipped", false));
            
            // Set duration fields
            if (interactionData.containsKey("skipPositionMs")) {
                interaction.setSkipPositionMs(((Number) interactionData.get("skipPositionMs")).intValue());
            }
            if (interactionData.containsKey("listenDurationMs")) {
                interaction.setListenDurationMs(((Number) interactionData.get("listenDurationMs")).intValue());
            }
            if (interactionData.containsKey("songDurationMs")) {
                interaction.setSongDurationMs(((Number) interactionData.get("songDurationMs")).intValue());
            }
            
            // Set timestamp
            interaction.setTimestamp(LocalDateTime.now());
            
            // Save and return
            UserSongInteraction saved = interactionRepository.save(interaction);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to record interaction",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserSongInteraction>> getUserInteractions(@PathVariable Long userId) {
        return ResponseEntity.ok(interactionRepository.findByUserId(userId));
    }
    
    @GetMapping("/user/{userId}/song/{songId}")
    public ResponseEntity<List<UserSongInteraction>> getUserSongInteractions(
            @PathVariable Long userId, 
            @PathVariable Long songId) {
        return ResponseEntity.ok(interactionRepository.findByUserIdAndSongId(userId, songId));
    }
    
    @GetMapping("/user/{userId}/skipped")
    public ResponseEntity<List<UserSongInteraction>> getUserSkippedSongs(@PathVariable Long userId) {
        return ResponseEntity.ok(interactionRepository.findBySkippedTrueAndUserId(userId));
    }
} 