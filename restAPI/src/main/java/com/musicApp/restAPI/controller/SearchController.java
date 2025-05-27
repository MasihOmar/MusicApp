package com.musicApp.restAPI.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.musicApp.restAPI.service.SearchService;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    
    private final SearchService searchService;
    
    @Autowired
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }
    
    @GetMapping
    public List<SongEntity> searchSongs(@RequestParam String query) {
        return searchService.searchSongs(query);
    }
} 