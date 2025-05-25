package com.musicApp.restAPI.sql.persistance.Song;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Data;

@Data
@Entity
@Table(name = "songs")
public class SongEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;

    private String artist;
    
    private String genre;
    
    private int releaseYear;
    
    private double tempo;
    
    private double energy;
    
    private int duration;
    
    @Column(name = "file_name")
    @JsonProperty("fileName")
    private String fileName;
    
    // Getter methods
    public long getId() {
        return id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public String getArtist() {
        return artist;
    }
    
    public String getGenre() {
        return genre;
    }
    
    public int getYear() {
        return releaseYear;
    }
    
    public double getTempo() {
        return tempo;
    }
    
    public double getEnergy() {
        return energy;
    }
    
    public int getDuration() {
        return duration;
    }

    public String getFileName() {
        return fileName;
    }
}
