package com.musicApp.restAPI.recommendation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

/**
 * A simple recommendation service that doesn't require model training.
 * This demonstrates alternatives to matrix factorization that don't need
 * iterative training procedures.
 */
@Service
public class SimpleRecommendationService {
    
    private final SongRepository songRepository;
    private final Random random = new Random();
    
    public SimpleRecommendationService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }
    
    /**
     * Get recommendations based on popularity.
     * This is a non-personalized approach that doesn't require training.
     */
    public List<SongEntity> getPopularityBasedRecommendations(int limit) {
        // In a real system, you would sort by play count
        // For this example, we'll simulate popularity with a static list
        List<SongEntity> allSongs = songRepository.findAll();
        
        // Sort by some popularity metric (in this case we're just simulating)
        // In a real system, you would track play counts or other engagement metrics
        Map<Long, Double> popularityScores = new HashMap<>();
        for (SongEntity song : allSongs) {
            // Assign a random popularity score for demonstration
            // In a real system, this would come from actual user interaction data
            popularityScores.put(song.getId(), random.nextDouble());
        }
        
        // Sort by popularity score
        List<SongEntity> popularSongs = allSongs.stream()
            .sorted((s1, s2) -> Double.compare(
                popularityScores.getOrDefault(s2.getId(), 0.0),
                popularityScores.getOrDefault(s1.getId(), 0.0)))
            .limit(limit)
            .collect(Collectors.toList());
        
        return popularSongs;
    }
    
    /**
     * Get recommendations based on content similarity.
     * This approach uses item attributes rather than user behavior.
     */
    public List<SongEntity> getContentBasedRecommendations(Long seedSongId, int limit) {
        List<SongEntity> recommendations = new ArrayList<>();
        
        // Get the seed song
        SongEntity seedSong = songRepository.findById(seedSongId).orElse(null);
        if (seedSong == null) {
            return recommendations;
        }
        
        // Get all songs
        List<SongEntity> allSongs = songRepository.findAll();
        
        // Calculate similarity to the seed song
        Map<Long, Double> similarityScores = new HashMap<>();
        for (SongEntity song : allSongs) {
            if (song.getId() == seedSongId) {
                continue; // Skip the seed song itself
            }
            
            // Calculate content similarity using metadata
            double similarity = calculateContentSimilarity(seedSong, song);
            similarityScores.put(song.getId(), similarity);
        }
        
        // Sort by similarity and take the top 'limit' songs
        recommendations = allSongs.stream()
            .filter(song -> song.getId() != seedSongId)
            .sorted((s1, s2) -> Double.compare(
                similarityScores.getOrDefault(s2.getId(), 0.0),
                similarityScores.getOrDefault(s1.getId(), 0.0)))
            .limit(limit)
            .collect(Collectors.toList());
        
        return recommendations;
    }
    
    /**
     * Calculate content similarity between two songs based on their attributes.
     * This doesn't require any training - it's just a distance measure.
     */
    private double calculateContentSimilarity(SongEntity song1, SongEntity song2) {
        // Genre similarity (exact match = 1.0, otherwise 0.0)
        double genreSimilarity = song1.getGenre().equals(song2.getGenre()) ? 1.0 : 0.0;
        
        // Year similarity (normalize by a reasonable range, e.g., 100 years)
        double yearDiff = Math.abs(song1.getYear() - song2.getYear()) / 100.0;
        double yearSimilarity = 1.0 - Math.min(yearDiff, 1.0);
        
        // Tempo similarity (normalize by a reasonable range, e.g., 200 BPM)
        double tempoDiff = Math.abs(song1.getTempo() - song2.getTempo()) / 200.0;
        double tempoSimilarity = 1.0 - Math.min(tempoDiff, 1.0);
        
        // Energy similarity (already in 0-1 range)
        double energyDiff = Math.abs(song1.getEnergy() - song2.getEnergy());
        double energySimilarity = 1.0 - energyDiff;
        
        // Weight the features (these weights could be adjusted)
        double similarity = 
            (genreSimilarity * 0.4) + 
            (energySimilarity * 0.3) + 
            (tempoSimilarity * 0.2) + 
            (yearSimilarity * 0.1);
        
        return similarity;
    }
    
    /**
     * Get random recommendations.
     * The simplest approach that requires no training or computation.
     */
    public List<SongEntity> getRandomRecommendations(int limit) {
        List<SongEntity> allSongs = songRepository.findAll();
        
        // Shuffle the list
        List<SongEntity> shuffledSongs = new ArrayList<>(allSongs);
        java.util.Collections.shuffle(shuffledSongs, random);
        
        // Take the first 'limit' songs
        return shuffledSongs.stream()
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Get genre-based recommendations.
     * Simple filtering approach that doesn't require training.
     */
    public List<SongEntity> getGenreRecommendations(String genre, int limit) {
        List<SongEntity> allSongs = songRepository.findAll();
        
        // Filter songs by genre
        List<SongEntity> genreSongs = allSongs.stream()
            .filter(song -> song.getGenre().equals(genre))
            .limit(limit)
            .collect(Collectors.toList());
        
        return genreSongs;
    }
} 