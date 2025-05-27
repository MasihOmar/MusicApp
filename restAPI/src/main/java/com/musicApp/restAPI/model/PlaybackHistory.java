package com.musicApp.restAPI.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "playback_history")
public class PlaybackHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "song_id", nullable = false)
    private Long songId;
    
    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getSongId() {
        return songId;
    }
    
    public void setSongId(Long songId) {
        this.songId = songId;
    }
    
    public LocalDateTime getPlayedAt() {
        return playedAt;
    }
    
    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }
} 