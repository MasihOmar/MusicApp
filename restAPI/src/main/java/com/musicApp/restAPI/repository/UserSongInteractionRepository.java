package com.musicApp.restAPI.repository;

import com.musicApp.restAPI.model.UserSongInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSongInteractionRepository extends JpaRepository<UserSongInteraction, Long> {
    List<UserSongInteraction> findByUserId(Long userId);
    List<UserSongInteraction> findByUserIdAndSongId(Long userId, Long songId);
    List<UserSongInteraction> findByUserIdOrderByTimestampDesc(Long userId);
    List<UserSongInteraction> findBySkippedTrueAndUserId(Long userId);
} 