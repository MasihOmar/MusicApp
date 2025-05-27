package com.musicApp.restAPI.sql.persistance.PlaylistSong;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSongEntity, Long> {
    boolean existsByPlaylistIdAndSongId(Long playlistId, Long songId);
    PlaylistSongEntity findByPlaylistIdAndSongId(Long playlistId, Long songId);
}
