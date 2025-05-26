package com.musicApp.restAPI.repository;

import com.musicApp.restAPI.model.PlaylistSong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("mainPlaylistSongRepository")
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {
    
    List<PlaylistSong> findByPlaylistId(Long playlistId);
    
    @Modifying
    @Query("DELETE FROM PlaylistSong ps WHERE ps.playlistId = :playlistId")
    void deletePlaylistSongs(@Param("playlistId") Long playlistId);
} 