package com.musicApp.restAPI.sql.persistance.Song;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Data;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.musicApp.restAPI.sql.persistance.User.UserEntity;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "songs")
public class SongEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String artist;
    
    private String album;
    
    private String genre;
    
    private int releaseYear;
    
    private double tempo;
    
    private double energy;
    
    private int duration;
    
    private String url;
    
    @Column(name = "file_name")
    @JsonProperty("fileName")
    private String fileName;
    
    @ManyToMany(mappedBy = "favoriteSongs")
    @JsonIgnore
    private List<UserEntity> favoritedByUsers = new ArrayList<>();
    
    // Getter methods
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getArtist() {
        return artist;
    }
    
    public void setArtist(String artist) {
        this.artist = artist;
    }
    
    public String getAlbum() {
        return album;
    }
    
    public void setAlbum(String album) {
        this.album = album;
    }
    
    public String getGenre() {
        return genre;
    }
    
    public void setGenre(String genre) {
        this.genre = genre;
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
    
    public void setDuration(int duration) {
        this.duration = duration;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }

    public String getFileName() {
        return fileName;
    }
    
    public List<UserEntity> getFavoritedByUsers() {
        return favoritedByUsers;
    }
    
    public void setFavoritedByUsers(List<UserEntity> favoritedByUsers) {
        this.favoritedByUsers = favoritedByUsers;
    }
}
