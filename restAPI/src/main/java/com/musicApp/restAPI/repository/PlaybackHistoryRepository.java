package com.musicApp.restAPI.repository;

import com.musicApp.restAPI.model.PlaybackHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaybackHistoryRepository extends JpaRepository<PlaybackHistory, Long> {
    
    List<PlaybackHistory> findByUserIdOrderByPlayedAtDesc(Long userId);
    
    @Query("SELECT ph FROM PlaybackHistory ph WHERE ph.userId = :userId ORDER BY ph.playedAt DESC")
    List<PlaybackHistory> findRecentPlaybacks(@Param("userId") Long userId);
    
    void deleteByUserIdAndSongId(Long userId, Long songId);
} 