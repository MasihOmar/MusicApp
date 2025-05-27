package com.musicApp.restAPI.sql.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

@Service
public class SongService {

    private final SongRepository songRepository;

    public SongService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    // Get all songs
    public List<SongEntity> getAllSongs() {
        return songRepository.findAll();
    }

    // Get song by ID
    public SongEntity getSongById(Long id) {
        return songRepository.findById(id).orElse(null);
    }

    // Create new song
    public SongEntity createSong(SongEntity song) {
        return songRepository.save(song);
    }

    // Delete song
    public boolean deleteSong(Long id) {
        Optional<SongEntity> song = songRepository.findById(id);
        if (song.isPresent()) {
            songRepository.delete(song.get());
            return true;
        }
        return false;
    }
}
