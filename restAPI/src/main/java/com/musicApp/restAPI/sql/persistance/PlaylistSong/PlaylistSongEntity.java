package com.musicApp.restAPI.sql.persistance.PlaylistSong;

import jakarta.persistence.*;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;

@Entity
@Table(name = "playlist_songs")
public class PlaylistSongEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "playlist_id")
    private PlaylistEntity playlist;
    
    @ManyToOne
    @JoinColumn(name = "song_id")
    private SongEntity song;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public PlaylistEntity getPlaylist() {
        return playlist;
    }
    
    public void setPlaylist(PlaylistEntity playlist) {
        this.playlist = playlist;
    }
    
    public SongEntity getSong() {
        return song;
    }
    
    public void setSong(SongEntity song) {
        this.song = song;
    }
}