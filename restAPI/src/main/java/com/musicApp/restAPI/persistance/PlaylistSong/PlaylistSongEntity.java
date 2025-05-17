package com.musicApp.restAPI.persistance.PlaylistSong;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @JsonIgnore
    private PlaylistEntity playlist;

    @ManyToOne
    @MapsId("songId")
    @JoinColumn(name = "song_id")
    @JsonIgnore
    private SongEntity song;

    public String getId(){
        return String.valueOf(this.id.getSongId());
    }

}