package com.musicApp.restAPI.controller;

import com.musicApp.restAPI.model.UserSongInteraction;
import com.musicApp.restAPI.repository.UserSongInteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/interactions")
public class UserInteractionController {
    
    @Autowired
    private UserSongInteractionRepository interactionRepository;
    
    @PostMapping
    public ResponseEntity<UserSongInteraction> recordInteraction(@RequestBody UserSongInteraction interaction) {
        // Set timestamp to now if not provided
        if (interaction.getTimestamp() == null) {
            interaction.setTimestamp(LocalDateTime.now());
        }
        return ResponseEntity.ok(interactionRepository.save(interaction));
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