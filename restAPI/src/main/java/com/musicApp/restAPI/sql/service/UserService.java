package com.musicApp.restAPI.sql.service;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;
import com.musicApp.restAPI.sql.persistance.User.UserRepository;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    public UserService(UserRepository repository, PasswordEncoder passwordEncoder,
                      PlaylistRepository playlistRepository, SongRepository songRepository) {
        this.userRepository = repository;
        this.passwordEncoder = passwordEncoder;
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
    }

    // get all users
    public List<UserEntity> getAllUsers() {
        return this.userRepository.findAll();
    }

    // find user by its id (renamed to match controller)
    public UserEntity getUserById(Long id) {
        return this.userRepository.findById(id).orElse(null);
    }

    // find user by username
    public UserEntity findUserByUsername(String username) {
        return this.userRepository.findByUsername(username)
            .orElse(null);
    }

    // find user by email
    public UserEntity findUserByEmail(String email) {
        return this.userRepository.findByEmail(email)
            .orElse(null);
    }

    // add new user (renamed to match controller)
    public UserEntity createUser(UserEntity user) {
        // Password is already hashed in the controller
        return this.userRepository.save(user);
    }

    // update user (updated to return UserEntity to match controller)
    public UserEntity updateUser(Long id, UserEntity user) {
        Optional<UserEntity> userOpt = this.userRepository.findById(id);
        if (userOpt.isPresent()) {
            UserEntity existingUser = userOpt.get();
            existingUser.setUsername(user.getUsername());
            // Only hash password if it's being changed
            if (user.getPassword_hash() != null && !user.getPassword_hash().equals(existingUser.getPassword_hash())) {
                existingUser.setPassword_hash(passwordEncoder.encode(user.getPassword_hash()));
            }
            return this.userRepository.save(existingUser);
        }
        return null;
    }

    // delete user
    public void deleteUser(Long id) {
        this.userRepository.deleteById(id);
    }
    
    // Create a new playlist for a user
    public PlaylistEntity createPlaylist(Long userId, PlaylistEntity playlist) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        playlist.setUser(user);
        return playlistRepository.save(playlist);
    }

    // Delete a playlist
    public boolean deletePlaylist(Long userId, Long playlistId) {
        PlaylistEntity playlist = playlistRepository.findById(playlistId).orElse(null);
        if (playlist == null || !playlist.getUser().getId().equals(userId)) {
            return false;
        }
        playlistRepository.delete(playlist);
        return true;
    }

    // Get user playlists
    public List<PlaylistEntity> getUserPlaylists(Long id) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }
        return playlistRepository.findByUser(user);
    }
    
    // Get user favorites
    public List<SongEntity> getUserFavorites(Long id) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ArrayList<>();
        }
        return songRepository.findByFavoritedByUsers(user);
    }
    
    // Add song to favorites
    public void addToFavorites(Long userId, Long songId) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        SongEntity song = songRepository.findById(songId).orElse(null);
        if (user != null && song != null) {
            user.getFavoriteSongs().add(song);
            userRepository.save(user);
        }
    }
    
    // Remove song from favorites
    public void removeFromFavorites(Long userId, Long songId) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        SongEntity song = songRepository.findById(songId).orElse(null);
        if (user != null && song != null) {
            user.getFavoriteSongs().remove(song);
            userRepository.save(user);
        }
    }
}
