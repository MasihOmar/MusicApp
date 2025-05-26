package com.musicApp.restAPI.sql.resource;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.service.SongService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("sqlSongController")
public class SongController {

    private SongService songService;

    public SongController(SongService service){
        this.songService = service;
    }

    @GetMapping(value = "/sql/songs")
    public List<SongEntity> getAllSongs(){
        return this.songService.getAllSongs();
    }

    @GetMapping(value = "/sql/songs/{id}")
    public SongEntity findSongById(@PathVariable Long id){
        return this.songService.findSongById(id);
    }

    @PostMapping(value = "/sql/songs/add")
    public void addSong(@RequestBody SongEntity song){
        this.songService.addSong(song);
    }

    @DeleteMapping(value = "/sql/songs/delete/{id}")
    public void deleteSong(@PathVariable Long id){
        this.songService.deleteSong(id);
    }
}
