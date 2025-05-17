package com.musicApp.restAPI.resource;

import com.musicApp.restAPI.persistance.Song.SongEntity;
import com.musicApp.restAPI.service.SongService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SongController {

    private SongService songService;

    public SongController(SongService service){
        this.songService = service;
    }

    @GetMapping(value = "/songs")
    public List<SongEntity> getAllSongs(){
        return this.songService.getAllSongs();
    }

    @GetMapping(value = "/songs/{id}")
    public SongEntity findSongById(@PathVariable Long id){
        return this.songService.findSongById(id);
    }

    @PostMapping(value = "/songs/add")
    public void addSong(@RequestBody SongEntity song){
        this.songService.addSong(song);
    }
}
