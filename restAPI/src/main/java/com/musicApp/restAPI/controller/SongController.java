package com.musicApp.restAPI.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.service.SongService;
import com.musicApp.restAPI.stream.SongStreamService;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/songs")
public class SongController {
    
    private final SongService songService;
    private final SongStreamService songStreamService;
    private static final Logger LOGGER = Logger.getLogger(SongController.class.getName());
    
    @Autowired
    public SongController(SongService songService, SongStreamService songStreamService) {
        this.songService = songService;
        this.songStreamService = songStreamService;
    }
    
    // Get all songs
    @GetMapping
    public ResponseEntity<?> getAllSongs() {
        try {
            List<SongEntity> songs = songService.getAllSongs();
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get songs: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get song by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSongById(@PathVariable Long id) {
        try {
            SongEntity song = songService.getSongById(id);
            if (song == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Song not found");
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(song);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get song: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Add new song
    @PostMapping
    public ResponseEntity<?> addSong(@RequestBody SongEntity song) {
        try {
            SongEntity createdSong = songService.createSong(song);
            return ResponseEntity.ok(createdSong);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add song: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Delete song
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSong(@PathVariable Long id) {
        try {
            boolean deleted = songService.deleteSong(id);
            if (!deleted) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Song not found");
                return ResponseEntity.notFound().build();
            }
            Map<String, String> response = new HashMap<>();
            response.put("message", "Song deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete song: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Stream song file
    @GetMapping("/{id}/stream")
    public ResponseEntity<Resource> streamSong(@PathVariable Long id) {
        try {
            SongEntity song = songService.getSongById(id);
            if (song == null) {
                LOGGER.warning("Song not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            String filename = song.getFileName();
            LOGGER.info("Attempting to stream song: " + filename + " (ID: " + id + ")");
            Resource songResource = songStreamService.getSongFile(filename);
            
            HttpHeaders headers = new HttpHeaders();
            // Set appropriate content type for audio
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());
            headers.setCacheControl("no-cache");
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "*");
            
            return new ResponseEntity<>(songResource, headers, HttpStatus.OK);
        } catch (Exception e) {
            LOGGER.severe("Error streaming song " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get song cover art
    @GetMapping("/{id}/cover")
    public ResponseEntity<Resource> getSongCover(@PathVariable Long id) {
        try {
            SongEntity song = songService.getSongById(id);
            if (song == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Try different possible image formats
            String baseFilename = song.getFileName().replace(".mp3", "");
            Resource coverResource = null;
            Exception lastException = null;
            
            // Try common image extensions
            for (String ext : new String[]{".png", ".jpg", ".jpeg"}) {
                try {
                    coverResource = songStreamService.getCoverFile(baseFilename + ext);
                    if (coverResource != null && coverResource.exists()) {
                        // Found a valid cover image
                        break;
                    }
                } catch (Exception e) {
                    lastException = e;
                    // Continue trying other extensions
                }
            }
            
            // If we couldn't find any matching cover art
            if (coverResource == null || !coverResource.exists()) {
                if (lastException != null) {
                    LOGGER.warning("Failed to load cover art for song " + id + ": " + lastException.getMessage());
                }
                return ResponseEntity.notFound().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentDisposition(ContentDisposition.inline().filename(baseFilename).build());
            headers.setCacheControl("no-cache");
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "*");
            
            return new ResponseEntity<>(coverResource, headers, HttpStatus.OK);
        } catch (Exception e) {
            LOGGER.severe("Error retrieving cover art for song " + id + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Search songs
    @GetMapping("/search")
    public ResponseEntity<?> searchSongs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String album) {
        try {
            // Get all songs and filter them based on the provided parameters
            List<SongEntity> allSongs = songService.getAllSongs();
            List<SongEntity> filteredSongs = allSongs.stream()
                .filter(song -> title == null || song.getTitle().toLowerCase().contains(title.toLowerCase()))
                .filter(song -> artist == null || song.getArtist().toLowerCase().contains(artist.toLowerCase()))
                .filter(song -> genre == null || song.getGenre().toLowerCase().contains(genre.toLowerCase()))
                .filter(song -> album == null || song.getAlbum().toLowerCase().contains(album.toLowerCase()))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(filteredSongs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Search failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 