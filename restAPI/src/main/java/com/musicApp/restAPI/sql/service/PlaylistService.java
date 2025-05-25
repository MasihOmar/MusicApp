package com.musicApp.restAPI.sql.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongId;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

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
    
    // Playlist sorting algorithm
    public List<SongEntity> optimizePlaylistOrder(Long playlistId, String optimizationType) {
        List<PlaylistSongEntity> playlistSongs = playlistSongRepository.findByPlaylistId(playlistId);
        List<SongEntity> songs = playlistSongs.stream()
            .map(PlaylistSongEntity::getSong)
            .collect(Collectors.toList());
        
        switch (optimizationType) {
            case "tempo":
                // Sort songs by tempo (ascending)
                songs.sort(Comparator.comparingDouble(SongEntity::getTempo));
                break;
            case "year":
                // Sort songs by release year
                songs.sort(Comparator.comparingInt(SongEntity::getYear));
                break;
            case "energy":
                // Sort songs by energy level for workout playlists
                songs.sort(Comparator.comparingDouble(SongEntity::getEnergy).reversed());
                break;
            case "shuffle":
                // Fisher-Yates shuffle algorithm
                Random rand = new Random();
                for (int i = songs.size() - 1; i > 0; i--) {
                    int j = rand.nextInt(i + 1);
                    SongEntity temp = songs.get(i);
                    songs.set(i, songs.get(j));
                    songs.set(j, temp);
                }
                break;
            default:
                // No sorting
                break;
        }
        
        return songs;
    }
}