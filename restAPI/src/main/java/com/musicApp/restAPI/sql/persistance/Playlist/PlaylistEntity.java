package com.musicApp.restAPI.sql.persistance.Playlist;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.musicApp.restAPI.sql.persistance.PlaylistSong.PlaylistSongEntity;
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

    @Column(name = "user_id")
    private Long userId;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PlaylistSongEntity> songs = new ArrayList<>();
}