package com.musicApp.restAPI.search;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistRepository;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongRepository;
import com.musicApp.restAPI.sql.persistance.User.UserRepository;

@Service
public class SearchService {
    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;
    private final UserRepository userRepository;
    
    public SearchService(SongRepository songRepository, 
                        PlaylistRepository playlistRepository,
                        UserRepository userRepository) {
        this.songRepository = songRepository;
        this.playlistRepository = playlistRepository;
        this.userRepository = userRepository;
    }
    
    // Trie-based search suggestion algorithm
    private TrieNode root = new TrieNode();
    
    public void buildSearchIndex() {
        // Build trie from all song titles
        List<SongEntity> allSongs = songRepository.findAll();
        for (SongEntity song : allSongs) {
            insertIntoTrie(song.getTitle().toLowerCase(), song.getId());
            // Also index artist names
            insertIntoTrie(song.getArtist().toLowerCase(), song.getId());
        }
    }
    
    private void insertIntoTrie(String word, Long id) {
        TrieNode current = root;
        for (char c : word.toCharArray()) {
            current.children.putIfAbsent(c, new TrieNode());
            current = current.children.get(c);
        }
        current.isEndOfWord = true;
        current.songIds.add(id);
    }
    
    public List<Long> autocompleteSuggestions(String prefix) {
        prefix = prefix.toLowerCase();
        TrieNode current = root;
        
        // Navigate to prefix node
        for (char c : prefix.toCharArray()) {
            if (!current.children.containsKey(c)) {
                return new ArrayList<>(); // No suggestions
            }
            current = current.children.get(c);
        }
        
        // Collect all song IDs from this node and its children
        List<Long> suggestions = new ArrayList<>();
        collectAllSongIds(current, suggestions);
        return suggestions;
    }
    
    private void collectAllSongIds(TrieNode node, List<Long> suggestions) {
        suggestions.addAll(node.songIds);
        
        for (TrieNode child : node.children.values()) {
            collectAllSongIds(child, suggestions);
        }
    }
    
    // Fuzzy search using Levenshtein distance algorithm
    public List<SongEntity> fuzzySearch(String query, int maxDistance) {
        final String queryLower = query.toLowerCase();
        List<SongEntity> allSongs = songRepository.findAll();
        
        return allSongs.stream()
            .filter(song -> {
                // Check title match
                int titleDistance = levenshteinDistance(queryLower, song.getTitle().toLowerCase());
                // Check artist match
                int artistDistance = levenshteinDistance(queryLower, song.getArtist().toLowerCase());
                // Return true if either title or artist matches within the distance
                return titleDistance <= maxDistance || artistDistance <= maxDistance;
            })
            .collect(Collectors.toList());
    }
    
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }
    
    // Helper class for Trie implementation
    private static class TrieNode {
        java.util.Map<Character, TrieNode> children = new java.util.HashMap<>();
        boolean isEndOfWord;
        List<Long> songIds = new ArrayList<>();
    }
}
