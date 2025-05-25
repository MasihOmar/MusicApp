package com.musicApp.restAPI.search;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.musicApp.restAPI.sql.persistance.Song.SongEntity;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    
    @Autowired
    private SearchService searchService;
    
    @GetMapping("/autocomplete")
    public ResponseEntity<List<Long>> getAutocomplete(@RequestParam String query) {
        return ResponseEntity.ok(searchService.autocompleteSuggestions(query));
    }
    
    @GetMapping("/fuzzy")
    public ResponseEntity<List<SongEntity>> fuzzySearch(
            @RequestParam String query, 
            @RequestParam(defaultValue = "2") int maxDistance) {
        return ResponseEntity.ok(searchService.fuzzySearch(query, maxDistance));
    }
    
    @PostMapping("/index")
    public ResponseEntity<String> buildSearchIndex() {
        searchService.buildSearchIndex();
        return ResponseEntity.ok("Search index built successfully");
    }
}
