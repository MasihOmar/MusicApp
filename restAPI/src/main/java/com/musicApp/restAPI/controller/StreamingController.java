package com.musicApp.restAPI.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.web.bind.annotation.*;
import com.musicApp.restAPI.stream.SongStreamService;

@RestController
@RequestMapping("/v1/api/streaming")
public class StreamingController {
    
    @Autowired
    private SongStreamService songStreamService;

    // Direct stream endpoint
    @GetMapping("/stream/{filename:.+}")
    public ResponseEntity<Resource> streamFile(@PathVariable String filename) {
        try {
            Resource song = songStreamService.getSongFile(filename);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());
            
            return new ResponseEntity<>(song, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Direct cover art endpoint
    @GetMapping("/cover/{filename:.+}")
    public ResponseEntity<Resource> getFileCoverArt(@PathVariable String filename) {
        try {
            Resource cover = songStreamService.getCoverFile(filename);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());
            
            return new ResponseEntity<>(cover, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
} 