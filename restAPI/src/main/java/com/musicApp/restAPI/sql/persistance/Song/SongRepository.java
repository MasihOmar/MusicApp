package com.musicApp.restAPI.sql.persistance.Song;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.musicApp.restAPI.sql.persistance.User.UserEntity;

@Repository
public interface SongRepository extends JpaRepository<SongEntity, Long> {
    List<SongEntity> findByFavoritedByUsers(UserEntity user);
}
