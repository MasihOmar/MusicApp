package com.musicApp.restAPI.persistance.PlaylistSong;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlaylistSongId implements Serializable {

    @Column(name = "playlist_id")
    private Long playlistId;

    @Column(name = "song_id")
    private Long songId;

    public PlaylistSongId() {}

    public PlaylistSongId(Long playlistId, Long songId){
        this.playlistId = playlistId;
        this.songId = songId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlaylistSongId)) return false;
        PlaylistSongId that = (PlaylistSongId) o;
        return Objects.equals(playlistId, that.playlistId) &&
                Objects.equals(songId, that.songId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playlistId, songId);
    }

    public Long getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(Long playlistId) {
        this.playlistId = playlistId;
    }

    public Long getSongId() {
        return songId;
    }

    public void setSongId(Long songId) {
        this.songId = songId;
    }
}
