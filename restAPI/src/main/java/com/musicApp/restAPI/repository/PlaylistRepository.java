package com.musicApp.restAPI.repository;

import com.musicApp.restAPI.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("mainPlaylistRepository")
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
} 