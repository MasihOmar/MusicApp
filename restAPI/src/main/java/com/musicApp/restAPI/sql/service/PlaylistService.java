package com.musicApp.restAPI.sql.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.musicApp.restAPI.datastructures.linkedlist.PlaylistLinkedListService;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    private final PlaylistLinkedListService playlistLinkedListService;

    @Autowired
    public PlaylistService(
            PlaylistRepository playlistRepository,
            SongRepository songRepository,
            PlaylistLinkedListService playlistLinkedListService) {
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
        this.playlistLinkedListService = playlistLinkedListService;
    }

    // Get all playlists
    public List<PlaylistEntity> getAllPlaylists() {
        return playlistRepository.findAll();
    }

    // Get playlist by ID
    public PlaylistEntity getPlaylistById(Long id) {
        return playlistRepository.findById(id).orElse(null);
    }

    // Create new playlist
    @Transactional
    public PlaylistEntity createPlaylist(PlaylistEntity playlist) {
        return playlistRepository.save(playlist);
    }

    // Delete playlist
    @Transactional
    public boolean deletePlaylist(Long id) {
        Optional<PlaylistEntity> playlist = playlistRepository.findById(id);
        if (playlist.isPresent()) {
            playlistRepository.delete(playlist.get());
            return true;
        }
        return false;
    }

    // Get songs in playlist
    public List<SongEntity> getPlaylistSongs(Long id) {
        PlaylistEntity playlist = playlistRepository.findById(id).orElse(null);
        if (playlist == null) {
            return null;
        }
        return playlistLinkedListService.getPlaylistSongs(playlist);
    }

    // Add song to playlist
    @Transactional
    public boolean addSongToPlaylist(Long playlistId, Long songId) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId).orElse(null);
        SongEntity song = songRepository.findById(songId).orElse(null);
        
        if (playlist != null && song != null) {
            playlistLinkedListService.addSongToPlaylist(playlist, song);
            return true;
        }
        return false;
    }

    // Remove song from playlist
    @Transactional
    public boolean removeSongFromPlaylist(Long playlistId, Long songId) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId).orElse(null);
        SongEntity song = songRepository.findById(songId).orElse(null);
        
        if (playlist != null && song != null) {
            playlistLinkedListService.removeSongFromPlaylist(playlist, song);
            return true;
        }
        return false;
    }

    // Reorder songs in playlist
    @Transactional
    public boolean reorderSongs(Long playlistId, List<Long> songIds) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId).orElse(null);
        if (playlist != null) {
            playlistLinkedListService.reorderSongs(playlist, songIds);
            return true;
        }
        return false;
    }

    // Optimize playlist
    public PlaylistEntity optimizePlaylist(Long id) {
        PlaylistEntity playlist = playlistRepository.findById(id).orElse(null);
        if (playlist == null) {
            return null;
        }
        
        // TODO: Implement playlist optimization logic
        // This could include:
        // 1. Reordering songs based on genre
        // 2. Balancing fast and slow songs
        // 3. Ensuring smooth transitions between songs
        // 4. Removing duplicate songs
        
        return playlist;
    }
} 