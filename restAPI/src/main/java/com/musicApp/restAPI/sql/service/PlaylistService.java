package com.musicApp.restAPI.sql.service;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongId;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        Optional<PlaylistEntity> playlistOpt = playlistRepository.findById(playlistId);
        Optional<SongEntity> songOpt = songRepository.findById(songId);

        if (playlistOpt.isPresent() && songOpt.isPresent()) {
            PlaylistSongEntity playlistSong = new PlaylistSongEntity();

            PlaylistSongId id = new PlaylistSongId(playlistId, songId);

            playlistSong.setId(id);
            playlistSong.setPlaylist(playlistOpt.get());
            playlistSong.setSong(songOpt.get());

            playlistSongRepository.save(playlistSong);
        }
    }

    // get songs from playlist
    public List<PlaylistSongEntity> getSongsFromPlaylist(Long playlistId) {
        return playlistSongRepository.findByPlaylistId(playlistId);
    }
}