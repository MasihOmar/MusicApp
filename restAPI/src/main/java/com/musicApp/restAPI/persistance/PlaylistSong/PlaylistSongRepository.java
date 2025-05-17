package com.musicApp.restAPI.persistance.PlaylistSong;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSongEntity, PlaylistSongId> {
    List<PlaylistSongEntity> findByPlaylistId(Long playlistId);
}
