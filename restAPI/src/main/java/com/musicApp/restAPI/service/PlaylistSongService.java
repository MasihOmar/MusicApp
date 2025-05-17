package com.musicApp.restAPI.service;

import com.musicApp.restAPI.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongId;
import com.musicApp.restAPI.persistance.Song.SongEntity;
import com.musicApp.restAPI.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongRepository;
import com.musicApp.restAPI.persistance.Song.SongRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlaylistSongService {

    private final PlaylistSongRepository playlistSongRepository;
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    public PlaylistSongService(PlaylistSongRepository playlistSongRepository,
                               PlaylistRepository playlistRepository,
                               SongRepository songRepository) {
        this.playlistSongRepository = playlistSongRepository;
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
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

    // delete song from playlist
    public void deleteSongFromPlaylist(PlaylistSongId playlistSongId) {
        playlistSongRepository.deleteById(playlistSongId);
    }

    // get songs from playlist
    public List<PlaylistSongEntity> getSongsByPlaylistId(Long playlistId) {
        return playlistSongRepository.findByPlaylistId(playlistId);
    }

    // find playlist song by id
    public Optional<PlaylistSongEntity> findSongById(PlaylistSongId playlistSongId) {
        return playlistSongRepository.findById(playlistSongId);
    }
}