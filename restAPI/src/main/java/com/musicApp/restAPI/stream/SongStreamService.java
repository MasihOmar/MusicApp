package com.musicApp.restAPI.stream;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public class SongStreamService {
    private static final String SONG_DIR = System.getProperty("user.home") + "/MusicApp/songs/";
    private static final String COVER_DIR = System.getProperty("user.home") + "/MusicApp/coverArt/";

    public Resource getSongFile(String filename) throws Exception {
        Path path = Paths.get(SONG_DIR + filename);
        if (!Files.exists(path)) {
            throw new Exception("MP3 file not found: " + filename);
        }
        return new FileSystemResource(path);
    }

    public Resource getCoverFile(String filename) throws Exception {
        Path path = Paths.get(COVER_DIR + filename);
        if (!Files.exists(path)) {
            throw new Exception("JPEG file not found: " + filename);
        }
        return new FileSystemResource(path);
    }
}
