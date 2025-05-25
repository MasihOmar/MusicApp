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
@RequestMapping("/api/simple-recommendations")
public class SimpleRecommendationController {
    
    @Autowired
    private SimpleRecommendationService simpleRecommendationService;
    
    @GetMapping("/popular")
    public ResponseEntity<List<SongEntity>> getPopularRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(simpleRecommendationService.getPopularityBasedRecommendations(limit));
    }
    
    @GetMapping("/random")
    public ResponseEntity<List<SongEntity>> getRandomRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(simpleRecommendationService.getRandomRecommendations(limit));
    }
    
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<SongEntity>> getGenreRecommendations(
            @PathVariable String genre,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(simpleRecommendationService.getGenreRecommendations(genre, limit));
    }
    
    @GetMapping("/similar/{songId}")
    public ResponseEntity<List<SongEntity>> getSimilarSongs(
            @PathVariable Long songId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(simpleRecommendationService.getContentBasedRecommendations(songId, limit));
    }
} 