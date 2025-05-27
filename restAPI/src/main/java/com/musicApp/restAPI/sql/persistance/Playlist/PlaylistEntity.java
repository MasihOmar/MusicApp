package com.musicApp.restAPI.sql.persistance.Playlist;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "Playlists")
public class PlaylistEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PlaylistSongEntity> playlistSongs = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public List<SongEntity> getSongs() {
        List<SongEntity> songs = new ArrayList<>();
        for (PlaylistSongEntity playlistSong : playlistSongs) {
            songs.add(playlistSong.getSong());
        }
        return songs;
    }

    public void addSong(SongEntity song) {
        PlaylistSongEntity playlistSong = new PlaylistSongEntity();
        playlistSong.setPlaylist(this);
        playlistSong.setSong(song);
        playlistSongs.add(playlistSong);
    }

    public void removeSong(SongEntity song) {
        playlistSongs.removeIf(ps -> ps.getSong().getId().equals(song.getId()));
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}