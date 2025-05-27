package com.musicApp.restAPI.stream;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

@Service
public class SongStreamService {
    private static final Logger LOGGER = Logger.getLogger(SongStreamService.class.getName());
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    private static final String SONGS_PATH = "classpath:static/music/";
    private static final String COVERS_PATH = "classpath:static/covers/";

    public Resource getSongFile(String filename) throws Exception {
        if (filename == null || filename.isEmpty()) {
            LOGGER.warning("Attempted to get song file with null or empty filename");
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }
        
        String resourcePath = SONGS_PATH + filename;
        LOGGER.info("Attempting to load song file from: " + resourcePath);
        
        Resource resource = resourceLoader.getResource(resourcePath);
        if (!resource.exists()) {
            LOGGER.warning("Song file not found: " + filename);
            throw new Exception("Song file not found: " + filename);
        }
        
        return resource;
    }

    public Resource getCoverFile(String filename) throws Exception {
        if (filename == null || filename.isEmpty()) {
            LOGGER.warning("Attempted to get cover file with null or empty filename");
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }
        
        String resourcePath = COVERS_PATH + filename;
        LOGGER.info("Attempting to load cover file from: " + resourcePath);
        
        Resource resource = resourceLoader.getResource(resourcePath);
        if (!resource.exists()) {
            LOGGER.warning("Cover file not found: " + filename);
            throw new Exception("Cover file not found: " + filename);
        }
        
        return resource;
    }
}
