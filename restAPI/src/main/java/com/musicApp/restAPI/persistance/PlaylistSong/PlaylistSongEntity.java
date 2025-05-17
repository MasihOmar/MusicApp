package com.musicApp.restAPI.persistance.PlaylistSong;

import com.musicApp.restAPI.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.persistance.Song.SongEntity;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Playlist_Songs")
public class PlaylistSongEntity {

    @EmbeddedId
    private PlaylistSongId id;

    @ManyToOne
    @MapsId("playlistId")
    @JoinColumn(name = "playlist_id")
    private PlaylistEntity playlist;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    private SongEntity song;

}