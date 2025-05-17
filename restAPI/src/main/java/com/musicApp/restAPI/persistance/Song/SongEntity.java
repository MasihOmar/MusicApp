package com.musicApp.restAPI.persistance.Song;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Songs")
public class SongEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;

    private String artist;
}
