package com.musicApp.restAPI.service;

import com.musicApp.restAPI.model.Playlist;
import com.musicApp.restAPI.model.PlaylistSong;
import com.musicApp.restAPI.repository.PlaylistRepository;
import com.musicApp.restAPI.repository.PlaylistSongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistService {

    @Autowired
    @Qualifier("mainPlaylistRepository")
    private PlaylistRepository playlistRepository;

    @Autowired
    @Qualifier("mainPlaylistSongRepository")
    private PlaylistSongRepository playlistSongRepository;

    public List<Playlist> getAllPlaylists() {
        return playlistRepository.findAll();
    }

    public Playlist getPlaylist(Long id) {
        return playlistRepository.findById(id).orElse(null);
    }

    public Playlist createPlaylist(Playlist playlist) {
        return playlistRepository.save(playlist);
    }

    @Transactional
    public void addSongToPlaylist(Long playlistId, Long songId) {
        PlaylistSong playlistSong = new PlaylistSong();
        playlistSong.setPlaylistId(playlistId);
        playlistSong.setSongId(songId);
        playlistSongRepository.save(playlistSong);
    }

    public List<PlaylistSong> getPlaylistSongs(Long playlistId) {
        return playlistSongRepository.findByPlaylistId(playlistId);
    }

    @Transactional
    public void deletePlaylist(Long id) {
        // First delete all songs in the playlist
        playlistSongRepository.deletePlaylistSongs(id);
        // Then delete the playlist itself
        playlistRepository.deleteById(id);
    }
} 