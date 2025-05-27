package com.musicApp.restAPI.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.musicApp.restAPI.service.RecommendationService;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    
    @Autowired
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }
    
    @GetMapping("/user/{userId}")
    public List<SongEntity> getUserRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return recommendationService.getRecommendedSongs(userId, limit);
    }
    
    @GetMapping("/genre/{genre}")
    public List<SongEntity> getGenreRecommendations(
            @PathVariable String genre,
            @RequestParam(defaultValue = "5") int clusters) {
        return recommendationService.getGenreBasedRecommendations(genre, clusters);
    }
    
    @GetMapping("/matrix/{userId}")
    public List<SongEntity> getMatrixRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        return recommendationService.getMatrixFactorizationRecommendations(userId, limit);
    }
} 