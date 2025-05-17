package com.musicApp.restAPI.service;

import com.musicApp.restAPI.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongRepository;
import com.musicApp.restAPI.persistance.Song.SongEntity;
import com.musicApp.restAPI.persistance.Song.SongRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final SongRepository songRepository;

    public PlaylistService(PlaylistRepository playlistRepository,
                           PlaylistSongRepository playlistSongRepository,
                           SongRepository songRepository) {
        this.playlistRepository = playlistRepository;
        this.playlistSongRepository = playlistSongRepository;
        this.songRepository = songRepository;
    }

    // get all playlist
    public List<PlaylistEntity> getAllPlaylists() {
        return playlistRepository.findAll();
    }

    // get playlist by id
    public PlaylistEntity getPlaylistById(Long id) {
        return playlistRepository.findById(id).orElse(null);
    }

    // create playlist
    public PlaylistEntity createPlaylist(PlaylistEntity playlist) {
        return playlistRepository.save(playlist);
    }

    // add song to playlist
    public void addSongToPlaylist(Long playlistId, Long songId) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId).orElseThrow();
        SongEntity song = songRepository.findById(songId).orElseThrow();

        PlaylistSongEntity ps = new PlaylistSongEntity();
        ps.setPlaylist(playlist);
        ps.setSong(song);

        playlistSongRepository.save(ps);
    }

    // get songs from playlist
    public List<PlaylistSongEntity> getSongsFromPlaylist(Long playlistId) {
        return playlistSongRepository.findByPlaylistId(playlistId);
    }
}