package com.musicApp.restAPI.controller;

import com.musicApp.restAPI.model.PlaybackHistory;
import com.musicApp.restAPI.service.PlaybackHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/api/playback-history")
public class PlaybackHistoryController {
    
    private final PlaybackHistoryService playbackHistoryService;
    
    @Autowired
    public PlaybackHistoryController(PlaybackHistoryService playbackHistoryService) {
        this.playbackHistoryService = playbackHistoryService;
    }
    
    @PostMapping("/record")
    public ResponseEntity<?> recordPlayback(@RequestBody Map<String, Long> request) {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Long songId = request.get("songId");
            
            if (songId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Missing songId in request"
                ));
            }
            
            playbackHistoryService.recordPlayback(userId, songId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to record playback",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentPlaybacks() {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<PlaybackHistory> playbacks = playbackHistoryService.getRecentPlaybacks(userId);
            return ResponseEntity.ok(playbacks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to get recent playbacks",
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearHistory() {
        try {
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            playbackHistoryService.clearHistory(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to clear history",
                "message", e.getMessage()
            ));
        }
    }
} 