package com.musicApp.restAPI.sql.service;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SongService {

    private final SongRepository songRepository;

    public SongService(SongRepository repository){
        this.songRepository = repository;
    }

    // get all songs
    public List<SongEntity> getAllSongs(){
        return this.songRepository.findAll();
    }

    // find song by its id
    public SongEntity findSongById(Long id){
        return this.songRepository.findById(id).get();
    }

    public void addSong(SongEntity song){
        this.songRepository.save(song);
    }

    public void deleteSong(Long id){
        this.songRepository.deleteById(id);
    }
}
