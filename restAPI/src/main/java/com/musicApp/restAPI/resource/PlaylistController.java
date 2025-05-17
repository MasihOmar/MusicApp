package com.musicApp.restAPI.resource;

import com.musicApp.restAPI.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.service.PlaylistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @GetMapping("/playlists")
    public List<PlaylistEntity> getAllPlaylists() {
        return playlistService.getAllPlaylists();
    }

    @GetMapping("/playlists/{id}")
    public PlaylistEntity getPlaylistById(@PathVariable Long id) {
        return playlistService.getPlaylistById(id);
    }

    @PostMapping("/playlists")
    public PlaylistEntity createPlaylist(@RequestBody PlaylistEntity playlist) {
        return playlistService.createPlaylist(playlist);
    }

    @PostMapping("/playlists/{playlistId}/songs/{songId}")
    public void addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistService.addSongToPlaylist(playlistId, songId);
    }

    @GetMapping("/playlists/{playlistId}/songs")
    public List<PlaylistSongEntity> getSongsFromPlaylist(@PathVariable Long playlistId) {
        return playlistService.getSongsFromPlaylist(playlistId);
    }
}