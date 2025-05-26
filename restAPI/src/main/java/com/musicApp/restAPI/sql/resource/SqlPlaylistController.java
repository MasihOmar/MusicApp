package com.musicApp.restAPI.sql.resource;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.service.SqlPlaylistService;

@RestController("sqlPlaylistController")
public class SqlPlaylistController {

    private final SqlPlaylistService playlistService;

    public SqlPlaylistController(SqlPlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @GetMapping("/sql/playlists")
    public List<PlaylistEntity> getAllPlaylists() {
        return playlistService.getAllPlaylists();
    }

    @GetMapping("/sql/playlists/{id}")
    public PlaylistEntity getPlaylistById(@PathVariable Long id) {
        return playlistService.getPlaylistById(id);
    }

    @PostMapping("/sql/playlists/add")
    public PlaylistEntity createPlaylist(@RequestBody PlaylistEntity playlist) {
        return playlistService.createPlaylist(playlist);
    }

    @PostMapping("/sql/playlists/add-song/playlist/{playlistId}/song/{songId}")
    public void addSongToPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistService.addSongToPlaylist(playlistId, songId);
    }

    @GetMapping("/sql/playlists/{playlistId}/songs")
    public List<PlaylistSongEntity> getSongsFromPlaylist(@PathVariable Long playlistId) {
        return playlistService.getSongsFromPlaylist(playlistId);
    }
    
    @DeleteMapping("/sql/playlists/delete/{id}")
    public void deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
    }

    @GetMapping("/playlists/{playlistId}/optimize")
    public List<SongEntity> optimizePlaylistOrder(
            @PathVariable Long playlistId, 
            @RequestParam(defaultValue = "shuffle") String type) {
        return playlistService.optimizePlaylistOrder(playlistId, type);
    }
}