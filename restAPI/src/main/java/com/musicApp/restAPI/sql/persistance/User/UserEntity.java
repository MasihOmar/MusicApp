package com.musicApp.restAPI.sql.persistance.User;

import jakarta.persistence.*;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password_hash;
    private String email;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_favorite_songs",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "song_id")
    )
    @JsonIgnore
    private List<SongEntity> favoriteSongs = new ArrayList<>();
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword_hash() {
        return password_hash;
    }
    
    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public List<SongEntity> getFavoriteSongs() {
        return favoriteSongs;
    }
    
    public void setFavoriteSongs(List<SongEntity> favoriteSongs) {
        this.favoriteSongs = favoriteSongs;
    }
}
