package com.musicApp.restAPI.resource;

import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongId;
import com.musicApp.restAPI.service.PlaylistSongService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
public class PlaylistSongController {

    private final PlaylistSongService playlistSongService;

    public PlaylistSongController(PlaylistSongService playlistSongService) {
        this.playlistSongService = playlistSongService;
    }

    // add songs to playlist
    @PostMapping("/playlist-songs/add/playlist/{playlistId}/song/{songId}")
    public void addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistSongService.addSongToPlaylist(playlistId, songId);
    }

    // get songs by playlist
    @GetMapping("/playlist-songs/get/playlist/{playlistId}")
    public List<PlaylistSongEntity> getSongsByPlaylist(@PathVariable Long playlistId) {
        return playlistSongService.getSongsByPlaylistId(playlistId);
    }

    // delete song from playlist
    @DeleteMapping("/playlist-songs/delete/playlist/{playlistId}/song/{songId}")
    public void deleteSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        PlaylistSongId playlistSongId = new PlaylistSongId(playlistId, songId);
        playlistSongService.deleteSongFromPlaylist(playlistSongId);
    }

    // get song by id
    @GetMapping("/playlist-songs/get/playlist/{playlistId}/song/{songId}")
    public Optional<PlaylistSongEntity> findSongById(@PathVariable Long playlistId, @PathVariable Long songId) {
        PlaylistSongId playlistSongId = new PlaylistSongId(playlistId, songId);
        return playlistSongService.findSongById(playlistSongId);
    }
}