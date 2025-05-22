package com.musicApp.restAPI.stream;

import org.springframework.core.io.*;
import org.springframework.stereotype.Service;

import java.nio.file.*;

@Service
public class SongStreamService {

    private static final String SONG_DIR = "C:\\MusicApp\\songs\\";
    private static final String COVER_DIR = "C:\\MusicApp\\coverArt\\";

    public Resource getSongFile(int id) throws Exception {
        Path path = Paths.get(SONG_DIR + id + ".mp3");
        if (!Files.exists(path)) {
            throw new Exception("MP3 file not found.");
        }
        return new FileSystemResource(path);
    }

    public Resource getCoverFile(int id) throws Exception {
        Path path = Paths.get(COVER_DIR + id + ".jpeg");
        if (!Files.exists(path)) {
            throw new Exception("JPEG file not found.");
        }
        return new FileSystemResource(path);
    }
}
