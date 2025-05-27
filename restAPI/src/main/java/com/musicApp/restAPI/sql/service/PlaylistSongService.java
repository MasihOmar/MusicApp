package com.musicApp.restAPI.sql.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongRepository;

@Service
public class PlaylistSongService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;
    private final PlaylistSongRepository playlistSongRepository;

    public PlaylistSongService(
            PlaylistRepository playlistRepository,
            SongRepository songRepository,
            PlaylistSongRepository playlistSongRepository) {
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
        this.playlistSongRepository = playlistSongRepository;
    }

    // Add song to playlist
    public boolean addSongToPlaylist(Long playlistId, Long songId) {
        Optional<PlaylistEntity> playlist = playlistRepository.findById(playlistId);
        Optional<SongEntity> song = songRepository.findById(songId);
        
        if (playlist.isPresent() && song.isPresent()) {
            PlaylistSongEntity playlistSong = new PlaylistSongEntity();
            playlistSong.setPlaylist(playlist.get());
            playlistSong.setSong(song.get());
            playlistSongRepository.save(playlistSong);
            return true;
        }
        return false;
    }

    // Get all songs in a playlist
    public List<SongEntity> getPlaylistSongs(Long playlistId) {
        Optional<PlaylistEntity> playlist = playlistRepository.findById(playlistId);
        if (playlist.isPresent()) {
            return playlist.get().getSongs();
        }
        return null;
    }

    // Check if song is in playlist
    public boolean isSongInPlaylist(Long playlistId, Long songId) {
        return playlistSongRepository.existsByPlaylistIdAndSongId(playlistId, songId);
    }

    // Remove song from playlist
    public boolean removeSongFromPlaylist(Long playlistId, Long songId) {
        PlaylistSongEntity playlistSong = playlistSongRepository
                .findByPlaylistIdAndSongId(playlistId, songId);
        
        if (playlistSong != null) {
            playlistSongRepository.delete(playlistSong);
            return true;
        }
        return false;
    }
}