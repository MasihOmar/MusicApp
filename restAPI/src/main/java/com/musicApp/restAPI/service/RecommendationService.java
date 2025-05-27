package com.musicApp.restAPI.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.musicApp.restAPI.model.UserSongInteraction;
import com.musicApp.restAPI.repository.UserSongInteractionRepository;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

@Service
public class RecommendationService {
    
    private final SongRepository songRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final Random random = new Random();
    
    @Autowired
    private UserSongInteractionRepository interactionRepository;
    
    // Matrix factorization parameters
    private static final int DEFAULT_LATENT_FACTORS = 10;
    private static final double DEFAULT_LEARNING_RATE = 0.01;
    private static final double DEFAULT_REGULARIZATION = 0.01;
    private static final int DEFAULT_ITERATIONS = 100;
    private static final double DEFAULT_BIAS_LEARNING_RATE = 0.005;
    
    public RecommendationService(SongRepository songRepository, 
                               PlaylistSongRepository playlistSongRepository) {
        this.songRepository = songRepository;
        this.playlistSongRepository = playlistSongRepository;
    }
    
    // Graph-based recommendation using collaborative filtering
    public List<SongEntity> getRecommendedSongs(Long userId, int limit) {
        // Build adjacency list representing user-song interactions
        Map<Long, Set<Long>> userSongGraph = buildUserSongGraph();
        
        // Get songs the user has listened to
        Set<Long> userSongs = userSongGraph.getOrDefault(userId, new HashSet<>());
        
        // If the user has no data, return random songs
        if (userSongs.isEmpty()) {
            return getRandomSongs(limit);
        }
        
        // Get songs the user has skipped to penalize them in recommendations
        Set<Long> skippedSongs = getSkippedSongs(userId);
        
        // Calculate song scores using collaborative filtering
        Map<Long, Double> songScores = new HashMap<>();
        
        for (Map.Entry<Long, Set<Long>> entry : userSongGraph.entrySet()) {
            if (entry.getKey().equals(userId)) continue;
            
            // Calculate similarity with other users (Jaccard similarity)
            Set<Long> otherUserSongs = entry.getValue();
            Set<Long> intersection = new HashSet<>(userSongs);
            intersection.retainAll(otherUserSongs);
            
            Set<Long> union = new HashSet<>(userSongs);
            union.addAll(otherUserSongs);
            
            if (union.isEmpty()) continue;
            
            double similarity = (double) intersection.size() / union.size();
            
            // Add score to songs this similar user listened to
            for (Long songId : otherUserSongs) {
                if (!userSongs.contains(songId)) {
                    double score = similarity;
                    
                    // Penalize skipped songs
                    if (skippedSongs.contains(songId)) {
                        score *= 0.3; // Reduce score by 70% for skipped songs
                    }
                    
                    songScores.put(songId, songScores.getOrDefault(songId, 0.0) + score);
                }
            }
        }
        
        // Get top scoring songs
        List<Map.Entry<Long, Double>> sortedSongs = new ArrayList<>(songScores.entrySet());
        sortedSongs.sort(Map.Entry.<Long, Double>comparingByValue().reversed());
        
        List<Long> recommendedSongIds = sortedSongs.stream()
            .limit(limit)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        
        // Fetch song entities
        List<SongEntity> recommendedSongs = new ArrayList<>();
        for (Long id : recommendedSongIds) {
            songRepository.findById(id).ifPresent(recommendedSongs::add);
        }
        
        // If no recommendations found, return random songs as fallback
        if (recommendedSongs.isEmpty()) {
            return getRandomSongs(limit);
        }
        
        return recommendedSongs;
    }
    
    // Helper to get random songs
    private List<SongEntity> getRandomSongs(int limit) {
        List<SongEntity> allSongs = songRepository.findAll();
        List<SongEntity> randomSongs = new ArrayList<>();
        if (allSongs.isEmpty()) return randomSongs;
        Set<Integer> usedIndexes = new HashSet<>();
        int max = Math.min(limit, allSongs.size());
        while (randomSongs.size() < max) {
            int idx = random.nextInt(allSongs.size());
            if (!usedIndexes.contains(idx)) {
                randomSongs.add(allSongs.get(idx));
                usedIndexes.add(idx);
            }
        }
        return randomSongs;
    }
    
    // Get songs the user has skipped
    private Set<Long> getSkippedSongs(Long userId) {
        List<UserSongInteraction> skippedInteractions = interactionRepository.findBySkippedTrueAndUserId(userId);
        return skippedInteractions.stream()
            .map(UserSongInteraction::getSongId)
            .collect(Collectors.toSet());
    }
    
    private Map<Long, Set<Long>> buildUserSongGraph() {
        // In a real implementation, you would use play history
        // This is a simplified example using playlist data
        Map<Long, Set<Long>> userSongGraph = new HashMap<>();
        
        // Get all playlist-song relationships
        // Note: This would need to be modified based on your actual data model
        playlistSongRepository.findAll().forEach(playlistSong -> {
            Long userId = playlistSong.getPlaylist().getUserId();
            Long songId = playlistSong.getSong().getId();
            
            userSongGraph.putIfAbsent(userId, new HashSet<>());
            userSongGraph.get(userId).add(songId);
        });
        
        // Incorporate user interactions - songs listened to (not skipped)
        interactionRepository.findAll().forEach(interaction -> {
            if (interaction.isPlayed() && !interaction.isSkipped()) {
                Long userId = interaction.getUserId();
                Long songId = interaction.getSongId();
                
                userSongGraph.putIfAbsent(userId, new HashSet<>());
                userSongGraph.get(userId).add(songId);
            }
        });
        
        return userSongGraph;
    }
    
    // K-means clustering for genre-based recommendations
    public List<SongEntity> getGenreBasedRecommendations(String genre, int k) {
        List<SongEntity> allSongs = songRepository.findAll();
        
        // Filter songs by genre
        List<SongEntity> genreSongs = allSongs.stream()
            .filter(song -> song.getGenre().equals(genre))
            .collect(Collectors.toList());
        
        if (genreSongs.size() <= k) {
            return genreSongs;
        }
        
        // Perform k-means clustering
        List<Cluster> clusters = kMeansClustering(genreSongs, k);
        
        // Return representative songs from each cluster
        return clusters.stream()
            .map(Cluster::getCentroidSong)
            .collect(Collectors.toList());
    }
    
    // Matrix Factorization recommendations
    public List<SongEntity> getMatrixFactorizationRecommendations(Long userId, int limit) {
        // Get all users and songs from the repository
        List<Long> allUserIds = getAllUserIds();
        List<SongEntity> allSongs = songRepository.findAll();
        
        // Build a rating matrix from user-song interactions
        Map<Long, Map<Long, Double>> ratingMatrix = buildRatingMatrix();
        
        // Map user and song IDs to array indices for matrix operations
        Map<Long, Integer> userIdToIndex = new HashMap<>();
        Map<Long, Integer> songIdToIndex = new HashMap<>();
        Map<Integer, Long> indexToSongId = new HashMap<>();
        
        int userIndex = 0;
        for (Long uid : allUserIds) {
            userIdToIndex.put(uid, userIndex++);
        }
        
        int songIndex = 0;
        for (SongEntity song : allSongs) {
            songIdToIndex.put(song.getId(), songIndex);
            indexToSongId.put(songIndex, song.getId());
            songIndex++;
        }
        
        // Get the index for our target user
        Integer userIdx = userIdToIndex.get(userId);
        if (userIdx == null) {
            // If user not found, return empty list
            return new ArrayList<>();
        }
        
        // Create matrices for user and item factors
        int numUsers = allUserIds.size();
        int numSongs = allSongs.size();
        int numFactors = DEFAULT_LATENT_FACTORS;
        
        // Initialize latent factor matrices with random values
        double[][] userFactors = initializeRandomMatrix(numUsers, numFactors);
        double[][] songFactors = initializeRandomMatrix(numSongs, numFactors);
        
        // Initialize bias terms
        double[] userBias = new double[numUsers];
        double[] songBias = new double[numSongs];
        double globalBias = calculateGlobalBias(ratingMatrix);
        
        // Perform matrix factorization using SGD
        learnFactors(ratingMatrix, userFactors, songFactors, userBias, songBias, 
                     globalBias, userIdToIndex, songIdToIndex);
        
        // Make predictions for the user
        Map<Long, Double> predictions = new HashMap<>();
        
        // Get songs the user has already interacted with
        Set<Long> userSongs = new HashSet<>();
        if (ratingMatrix.containsKey(userId)) {
            userSongs.addAll(ratingMatrix.get(userId).keySet());
        }
        
        // Get songs the user has skipped to filter them out
        Set<Long> skippedSongs = getSkippedSongs(userId);
        
        // Make predictions for all songs the user hasn't interacted with
        for (int i = 0; i < numSongs; i++) {
            Long songId = indexToSongId.get(i);
            
            // Skip songs the user has already interacted with
            if (userSongs.contains(songId)) {
                continue;
            }
            
            // Calculate predicted rating
            double predictedRating = predict(userIdx, i, userFactors, songFactors, 
                                            userBias, songBias, globalBias);
            
            // Apply penalty for skipped songs
            if (skippedSongs.contains(songId)) {
                predictedRating *= 0.3; // Reduce rating by 70%
            }
            
            predictions.put(songId, predictedRating);
        }
        
        // Sort songs by predicted rating and take the top 'limit' songs
        List<Map.Entry<Long, Double>> sortedPredictions = new ArrayList<>(predictions.entrySet());
        sortedPredictions.sort(Map.Entry.<Long, Double>comparingByValue().reversed());
        
        List<Long> topSongIds = sortedPredictions.stream()
                                 .limit(limit)
                                 .map(Map.Entry::getKey)
                                 .collect(Collectors.toList());
        
        // Fetch and return the recommended songs
        List<SongEntity> recommendedSongs = new ArrayList<>();
        for (Long songId : topSongIds) {
            songRepository.findById(songId).ifPresent(recommendedSongs::add);
        }
        
        return recommendedSongs;
    }
    
    // Initialize a matrix with small random values
    private double[][] initializeRandomMatrix(int rows, int cols) {
        double[][] matrix = new double[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                matrix[i][j] = 0.1 * random.nextDouble();
            }
        }
        return matrix;
    }
    
    // Calculate the global average rating
    private double calculateGlobalBias(Map<Long, Map<Long, Double>> ratingMatrix) {
        double sum = 0;
        int count = 0;
        
        for (Map<Long, Double> userRatings : ratingMatrix.values()) {
            for (Double rating : userRatings.values()) {
                sum += rating;
                count++;
            }
        }
        
        return count > 0 ? sum / count : 0;
    }
    
    // Build a rating matrix from user interactions
    private Map<Long, Map<Long, Double>> buildRatingMatrix() {
        Map<Long, Map<Long, Double>> ratingMatrix = new HashMap<>();
        
        // For this educational example, we'll use binary ratings based on playlist data
        // 1.0 if song is in user's playlist, 0.0 otherwise
        playlistSongRepository.findAll().forEach(playlistSong -> {
            Long userId = playlistSong.getPlaylist().getUserId();
            Long songId = playlistSong.getSong().getId();
            
            ratingMatrix.putIfAbsent(userId, new HashMap<>());
            ratingMatrix.get(userId).put(songId, 1.0); // User has this song in their playlist
        });
        
        // Incorporate user interactions to adjust ratings
        interactionRepository.findAll().forEach(interaction -> {
            Long userId = interaction.getUserId();
            Long songId = interaction.getSongId();
            
            if (!ratingMatrix.containsKey(userId)) {
                ratingMatrix.put(userId, new HashMap<>());
            }
            
            // Get existing rating or default to 0.5 (neutral)
            double currentRating = ratingMatrix.get(userId).getOrDefault(songId, 0.5);
            
            // Adjust rating based on interactions
            if (interaction.isSkipped()) {
                // Decrease rating if skipped (more decrease for early skips)
                double skipPenalty = calculateSkipPenalty(interaction);
                currentRating -= skipPenalty;
            }
            
            if (interaction.isCompleted()) {
                // Increase rating if song was listened to completion
                currentRating += 0.5;
            }
            
            // Ensure rating stays in reasonable bounds
            currentRating = Math.max(0.0, Math.min(currentRating, 5.0));
            
            // Update the rating
            ratingMatrix.get(userId).put(songId, currentRating);
        });
        
        return ratingMatrix;
    }
    
    // Helper method to calculate skip penalty
    private double calculateSkipPenalty(UserSongInteraction interaction) {
        // Early skips (first 20%) are penalized more
        int skipPositionMs = interaction.getSkipPositionMs();
        int totalDurationMs = interaction.getSongDurationMs();
        
        if (totalDurationMs == 0) return 0.5; // Default penalty
        
        double percentListened = (double) skipPositionMs / totalDurationMs;
        if (percentListened < 0.2) {
            return 0.7; // Strong penalty for early skips
        } else if (percentListened < 0.5) {
            return 0.4; // Medium penalty
        } else {
            return 0.2; // Lower penalty for late skips (user heard most of song)
        }
    }
    
    // Get all user IDs from the user-song interactions
    private List<Long> getAllUserIds() {
        Set<Long> userIds = new HashSet<>();
        
        playlistSongRepository.findAll().forEach(playlistSong -> {
            userIds.add(playlistSong.getPlaylist().getUserId());
        });
        
        // Add users from interaction data
        interactionRepository.findAll().forEach(interaction -> {
            userIds.add(interaction.getUserId());
        });
        
        return new ArrayList<>(userIds);
    }
    
    // Matrix factorization learning using SGD (Stochastic Gradient Descent)
    private void learnFactors(Map<Long, Map<Long, Double>> ratingMatrix,
                            double[][] userFactors, double[][] songFactors,
                            double[] userBias, double[] songBias,
                            double globalBias,
                            Map<Long, Integer> userIdToIndex,
                            Map<Long, Integer> songIdToIndex) {
        // Learning rate and regularization parameters
        double learningRate = DEFAULT_LEARNING_RATE;
        double biasLearningRate = DEFAULT_BIAS_LEARNING_RATE;
        double regularization = DEFAULT_REGULARIZATION;
        int iterations = DEFAULT_ITERATIONS;
        
        // Perform stochastic gradient descent
        for (int iter = 0; iter < iterations; iter++) {
            // Compute RMSE to track convergence
            double rmse = 0;
            int count = 0;
            
            // Iterate over all ratings
            for (Map.Entry<Long, Map<Long, Double>> userEntry : ratingMatrix.entrySet()) {
                Long userId = userEntry.getKey();
                Integer userIdx = userIdToIndex.get(userId);
                
                if (userIdx == null) continue;
                
                for (Map.Entry<Long, Double> songEntry : userEntry.getValue().entrySet()) {
                    Long songId = songEntry.getKey();
                    Integer songIdx = songIdToIndex.get(songId);
                    
                    if (songIdx == null) continue;
                    
                    double actualRating = songEntry.getValue();
                    double predictedRating = predict(userIdx, songIdx, userFactors, songFactors, 
                                                   userBias, songBias, globalBias);
                    
                    // Calculate error
                    double error = actualRating - predictedRating;
                    rmse += error * error;
                    count++;
                    
                    // Update biases
                    userBias[userIdx] += biasLearningRate * (error - regularization * userBias[userIdx]);
                    songBias[songIdx] += biasLearningRate * (error - regularization * songBias[songIdx]);
                    
                    // Update latent factors
                    for (int f = 0; f < userFactors[0].length; f++) {
                        double userFactorValue = userFactors[userIdx][f];
                        double songFactorValue = songFactors[songIdx][f];
                        
                        userFactors[userIdx][f] += learningRate * (error * songFactorValue - regularization * userFactorValue);
                        songFactors[songIdx][f] += learningRate * (error * userFactorValue - regularization * songFactorValue);
                    }
                }
            }
            
            // Calculate RMSE for this iteration
            rmse = count > 0 ? Math.sqrt(rmse / count) : 0;
            
            // Decay learning rate over time for better convergence
            learningRate *= 0.9;
            biasLearningRate *= 0.9;
        }
    }
    
    // Predict rating using matrix factorization model
    private double predict(int userIdx, int songIdx, 
                         double[][] userFactors, double[][] songFactors,
                         double[] userBias, double[] songBias, 
                         double globalBias) {
        // Prediction = global bias + user bias + song bias + dot product of user and song factors
        double prediction = globalBias;
        prediction += userBias[userIdx];
        prediction += songBias[songIdx];
        
        // Add dot product of latent factors
        for (int f = 0; f < userFactors[0].length; f++) {
            prediction += userFactors[userIdx][f] * songFactors[songIdx][f];
        }
        
        return prediction;
    }
    
    private List<Cluster> kMeansClustering(List<SongEntity> songs, int k) {
        // Initialize k clusters with random centroids
        List<Cluster> clusters = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < k; i++) {
            int randomIndex = random.nextInt(songs.size());
            clusters.add(new Cluster(songs.get(randomIndex)));
        }
        
        boolean changed = true;
        int maxIterations = 100;
        int iteration = 0;
        
        while (changed && iteration < maxIterations) {
            // Clear clusters
            clusters.forEach(Cluster::clear);
            
            // Assign songs to nearest cluster
            for (SongEntity song : songs) {
                Cluster nearestCluster = findNearestCluster(song, clusters);
                nearestCluster.addSong(song);
            }
            
            // Update centroids
            changed = false;
            for (Cluster cluster : clusters) {
                if (cluster.updateCentroid()) {
                    changed = true;
                }
            }
            
            iteration++;
        }
        
        return clusters;
    }
    
    private Cluster findNearestCluster(SongEntity song, List<Cluster> clusters) {
        Cluster nearest = null;
        double minDistance = Double.MAX_VALUE;
        
        for (Cluster cluster : clusters) {
            double distance = calculateDistance(song, cluster.getCentroidSong());
            if (distance < minDistance) {
                minDistance = distance;
                nearest = cluster;
            }
        }
        
        return nearest;
    }
    
    private double calculateDistance(SongEntity song1, SongEntity song2) {
        // Simple distance measure based on features
        // In a real app, you would use audio features like tempo, energy, etc.
        double genreDistance = song1.getGenre().equals(song2.getGenre()) ? 0 : 1;
        double yearDistance = Math.abs(song1.getYear() - song2.getYear()) / 100.0; 
        double tempoDistance = Math.abs(song1.getTempo() - song2.getTempo()) / 200.0;
        double energyDistance = Math.abs(song1.getEnergy() - song2.getEnergy());
        
        return genreDistance + yearDistance + tempoDistance + energyDistance;
    }
    
    // Helper class for K-means clustering
    private static class Cluster {
        private SongEntity centroidSong;
        private List<SongEntity> songs = new ArrayList<>();
        
        public Cluster(SongEntity centroidSong) {
            this.centroidSong = centroidSong;
        }
        
        public void clear() {
            songs.clear();
        }
        
        public void addSong(SongEntity song) {
            songs.add(song);
        }
        
        public SongEntity getCentroidSong() {
            return centroidSong;
        }
        
        public boolean updateCentroid() {
            if (songs.isEmpty()) return false;
            
            // Find the song closest to the center of the cluster
            SongEntity newCentroid = findCentralSong();
            boolean changed = !newCentroid.equals(centroidSong);
            centroidSong = newCentroid;
            return changed;
        }
        
        private SongEntity findCentralSong() {
            // Simple implementation - find the song with minimal
            // average distance to all other songs
            SongEntity centralSong = songs.get(0);
            double minAvgDistance = Double.MAX_VALUE;
            
            for (SongEntity song1 : songs) {
                double totalDistance = 0;
                for (SongEntity song2 : songs) {
                    if (!song1.equals(song2)) {
                        // Calculate distance using the same distance function
                        double genreDistance = song1.getGenre().equals(song2.getGenre()) ? 0 : 1;
                        double yearDistance = Math.abs(song1.getYear() - song2.getYear()) / 100.0;
                        double tempoDistance = Math.abs(song1.getTempo() - song2.getTempo()) / 200.0;
                        double energyDistance = Math.abs(song1.getEnergy() - song2.getEnergy());
                        
                        totalDistance += genreDistance + yearDistance + tempoDistance + energyDistance;
                    }
                }
                
                double avgDistance = songs.size() > 1 ? totalDistance / (songs.size() - 1) : 0;
                if (avgDistance < minAvgDistance) {
                    minAvgDistance = avgDistance;
                    centralSong = song1;
                }
            }
            
            return centralSong;
        }
    }
} 