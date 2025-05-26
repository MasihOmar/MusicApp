package com.musicApp.restAPI.sql.resource;

import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongId;
import com.musicApp.restAPI.sql.service.PlaylistSongService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController("sqlPlaylistSongController")
public class PlaylistSongController {

    private final PlaylistSongService playlistSongService;

    public PlaylistSongController(PlaylistSongService playlistSongService) {
        this.playlistSongService = playlistSongService;
    }

    // add songs to playlist
    @PostMapping("/sql/playlist-songs/add/playlist/{playlistId}/song/{songId}")
    public void addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistSongService.addSongToPlaylist(playlistId, songId);
    }

    // get songs by playlist
    @GetMapping("/sql/playlist-songs/get/playlist/{playlistId}")
    public List<PlaylistSongEntity> getSongsByPlaylist(@PathVariable Long playlistId) {
        return playlistSongService.getSongsByPlaylistId(playlistId);
    }

    // delete song from playlist
    @DeleteMapping("/sql/playlist-songs/delete/playlist/{playlistId}/song/{songId}")
    public void deleteSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        PlaylistSongId playlistSongId = new PlaylistSongId(playlistId, songId);
        playlistSongService.deleteSongFromPlaylist(playlistSongId);
    }

    // get song by id
    @GetMapping("/sql/playlist-songs/get/playlist/{playlistId}/song/{songId}")
    public Optional<PlaylistSongEntity> findSongById(@PathVariable Long playlistId, @PathVariable Long songId) {
        PlaylistSongId playlistSongId = new PlaylistSongId(playlistId, songId);
        return playlistSongService.findSongById(playlistSongId);
    }
}