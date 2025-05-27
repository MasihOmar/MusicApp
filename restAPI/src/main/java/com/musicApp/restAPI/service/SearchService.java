package com.musicApp.restAPI.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;

@Service
public class SearchService {
    
    private final SongRepository songRepository;
    
    @Autowired
    public SearchService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }
    
    public List<SongEntity> searchSongs(String query) {
        List<SongEntity> allSongs = songRepository.findAll();
        return allSongs.stream()
            .filter(song -> song.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                           song.getArtist().toLowerCase().contains(query.toLowerCase()) ||
                           song.getGenre().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
    }
} 