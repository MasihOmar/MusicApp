package com.musicApp.restAPI.service;

import com.musicApp.restAPI.model.PlaybackHistory;
import com.musicApp.restAPI.repository.PlaybackHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaybackHistoryService {
    
    private final PlaybackHistoryRepository playbackHistoryRepository;
    private static final int MAX_HISTORY_SIZE = 50; // Maximum number of songs to keep in history
    
    @Autowired
    public PlaybackHistoryService(PlaybackHistoryRepository playbackHistoryRepository) {
        this.playbackHistoryRepository = playbackHistoryRepository;
    }
    
    public void recordPlayback(Long userId, Long songId) {
        // Create new playback record
        PlaybackHistory playback = new PlaybackHistory();
        playback.setUserId(userId);
        playback.setSongId(songId);
        playback.setPlayedAt(LocalDateTime.now());
        
        // Save to database
        playbackHistoryRepository.save(playback);
        
        // Clean up old records if needed
        List<PlaybackHistory> userHistory = playbackHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId);
        if (userHistory.size() > MAX_HISTORY_SIZE) {
            List<PlaybackHistory> toDelete = userHistory.subList(MAX_HISTORY_SIZE, userHistory.size());
            toDelete.forEach(record -> 
                playbackHistoryRepository.deleteByUserIdAndSongId(record.getUserId(), record.getSongId())
            );
        }
    }
    
    public List<Long> getRecentSongIds(Long userId) {
        return playbackHistoryRepository.findRecentPlaybacks(userId)
            .stream()
            .map(PlaybackHistory::getSongId)
            .collect(Collectors.toList());
    }
    
    public List<PlaybackHistory> getRecentPlaybacks(Long userId) {
        return playbackHistoryRepository.findRecentPlaybacks(userId);
    }
    
    public void clearHistory(Long userId) {
        List<PlaybackHistory> userHistory = playbackHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId);
        userHistory.forEach(record -> 
            playbackHistoryRepository.deleteByUserIdAndSongId(record.getUserId(), record.getSongId())
        );
    }
} 