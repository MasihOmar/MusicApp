package com.musicApp.restAPI.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.service.PlaylistService;
import com.musicApp.restAPI.sql.service.UserService;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {
    
    private final PlaylistService playlistService;
    private final UserService userService;
    
    @Autowired
    public PlaylistController(PlaylistService playlistService, UserService userService) {
        this.playlistService = playlistService;
        this.userService = userService;
    }
    
    // Get all playlists
    @GetMapping
    public ResponseEntity<?> getAllPlaylists(@RequestParam(required = false) Long userId) {
        try {
            List<PlaylistEntity> playlists;
            if (userId != null) {
                playlists = userService.getUserPlaylists(userId);
            } else {
                playlists = playlistService.getAllPlaylists();
            }
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get playlists: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get playlist by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlaylistById(@PathVariable Long id) {
        try {
            PlaylistEntity playlist = playlistService.getPlaylistById(id);
            if (playlist == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Playlist not found");
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Create new playlist
    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody PlaylistEntity playlist) {
        try {
            // Get current user ID from security context
            Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (userId == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not authenticated");
                return ResponseEntity.status(401).body(error);
            }

            // Create playlist through user service to ensure proper user association
            PlaylistEntity createdPlaylist = userService.createPlaylist(userId, playlist);
            if (createdPlaylist == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to create playlist");
                return ResponseEntity.badRequest().body(error);
            }
            return ResponseEntity.ok(createdPlaylist);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Delete playlist
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlaylist(@PathVariable Long id) {
        try {
            boolean deleted = playlistService.deletePlaylist(id);
            if (!deleted) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Playlist not found");
                return ResponseEntity.notFound().build();
            }
            Map<String, String> response = new HashMap<>();
            response.put("message", "Playlist deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get songs in playlist
    @GetMapping("/{id}/songs")
    public ResponseEntity<?> getPlaylistSongs(@PathVariable Long id) {
        try {
            List<SongEntity> songs = playlistService.getPlaylistSongs(id);
            if (songs == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Playlist not found");
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get playlist songs: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Add song to playlist - Single song (legacy support)
    @PostMapping("/{id}/songs/{songId}")
    public ResponseEntity<?> addSongToPlaylist(@PathVariable Long id, @PathVariable Long songId) {
        try {
            boolean added = playlistService.addSongToPlaylist(id, songId);
            if (!added) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to add song to playlist");
                return ResponseEntity.badRequest().body(error);
            }
            Map<String, String> response = new HashMap<>();
            response.put("message", "Song added to playlist successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add song to playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Add songs to playlist - Batch operation
    @PostMapping("/{id}/songs")
    public ResponseEntity<?> addSongsToPlaylist(@PathVariable Long id, @RequestBody List<Long> songIds) {
        try {
            Map<String, Object> result = new HashMap<>();
            int addedCount = 0;
            
            for (Long songId : songIds) {
                if (playlistService.addSongToPlaylist(id, songId)) {
                    addedCount++;
                }
            }
            
            result.put("success", true);
            result.put("addedCount", addedCount);
            result.put("totalCount", songIds.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add songs to playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Remove song from playlist
    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<?> removeSongFromPlaylist(@PathVariable Long id, @PathVariable Long songId) {
        try {
            boolean removed = playlistService.removeSongFromPlaylist(id, songId);
            if (!removed) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to remove song from playlist");
                return ResponseEntity.badRequest().body(error);
            }
            Map<String, String> response = new HashMap<>();
            response.put("message", "Song removed from playlist successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to remove song from playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Remove songs from playlist - Batch operation
    @DeleteMapping("/{id}/songs")
    public ResponseEntity<?> removeSongsFromPlaylist(@PathVariable Long id, @RequestBody List<Long> songIds) {
        try {
            Map<String, Object> result = new HashMap<>();
            int removedCount = 0;
            
            for (Long songId : songIds) {
                if (playlistService.removeSongFromPlaylist(id, songId)) {
                    removedCount++;
                }
            }
            
            result.put("success", true);
            result.put("removedCount", removedCount);
            result.put("totalCount", songIds.size());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to remove songs from playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Optimize playlist
    @GetMapping("/{id}/optimize")
    public ResponseEntity<?> optimizePlaylist(@PathVariable Long id) {
        try {
            PlaylistEntity optimizedPlaylist = playlistService.optimizePlaylist(id);
            if (optimizedPlaylist == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Playlist not found");
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(optimizedPlaylist);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to optimize playlist: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 