package com.musicApp.restAPI.datastructures.linkedlist;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "playlist_nodes")
@Data
public class PlaylistNode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "song_id")
    private SongEntity song;

    @ManyToOne
    @JoinColumn(name = "playlist_id")
    private com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity playlist;

    @Column(name = "position")
    private Integer position;

    @Column(name = "next_node_id")
    private Long nextNodeId;

    @Column(name = "prev_node_id")
    private Long prevNodeId;

    public PlaylistNode() {}

    public PlaylistNode(SongEntity song, Integer position) {
        this.song = song;
        this.position = position;
    }
} 