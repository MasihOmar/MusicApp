package com.musicApp.restAPI.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_song_interactions")
public class UserSongInteraction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private Long songId;
    
    // Interaction types
    private boolean played = false;
    private boolean completed = false;
    private boolean skipped = false;
    
    // Additional data for more detailed analysis
    private int skipPositionMs = 0;  // Position when skipped
    private int listenDurationMs = 0;  // How long they listened
    private int songDurationMs = 0;   // Total duration of the song
    
    private LocalDateTime timestamp = LocalDateTime.now();
    
    // Getters and setters
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

    public boolean isPlayed() {
        return played;
    }

    public void setPlayed(boolean played) {
        this.played = played;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public boolean isSkipped() {
        return skipped;
    }

    public void setSkipped(boolean skipped) {
        this.skipped = skipped;
    }

    public int getSkipPositionMs() {
        return skipPositionMs;
    }

    public void setSkipPositionMs(int skipPositionMs) {
        this.skipPositionMs = skipPositionMs;
    }

    public int getListenDurationMs() {
        return listenDurationMs;
    }

    public void setListenDurationMs(int listenDurationMs) {
        this.listenDurationMs = listenDurationMs;
    }
    
    public int getSongDurationMs() {
        return songDurationMs;
    }

    public void setSongDurationMs(int songDurationMs) {
        this.songDurationMs = songDurationMs;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
} 