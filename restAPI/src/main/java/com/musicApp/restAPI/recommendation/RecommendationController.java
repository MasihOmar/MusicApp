package com.musicApp.restAPI.recommendation;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SongEntity>> getUserRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendedSongs(userId, limit));
    }
    
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<SongEntity>> getGenreRecommendations(
            @PathVariable String genre,
            @RequestParam(defaultValue = "5") int clusters) {
        return ResponseEntity.ok(recommendationService.getGenreBasedRecommendations(genre, clusters));
    }
    
    @GetMapping("/matrix/{userId}")
    public ResponseEntity<List<SongEntity>> getMatrixFactorizationRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getMatrixFactorizationRecommendations(userId, limit));
    }
} 