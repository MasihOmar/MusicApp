package com.musicApp.restAPI.sql.persistance.Playlist;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;

@Repository
public interface PlaylistRepository extends JpaRepository<PlaylistEntity, Long> {
    List<PlaylistEntity> findByUser(UserEntity user);
}
