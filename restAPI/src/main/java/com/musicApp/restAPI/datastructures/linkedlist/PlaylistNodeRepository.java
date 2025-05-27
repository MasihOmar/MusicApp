package com.musicApp.restAPI.datastructures.linkedlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlaylistNodeRepository extends JpaRepository<PlaylistNode, Long> {
    List<PlaylistNode> findByPlaylistIdOrderByPositionAsc(Long playlistId);
    PlaylistNode findByPlaylistIdAndPosition(Long playlistId, Integer position);
    void deleteByPlaylistId(Long playlistId);
} 