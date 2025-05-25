package com.musicApp.restAPI.stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class SongStreamController {

    @Autowired
    private SongStreamService songStreamService;

    @GetMapping("/stream/song/{filename:.+}")
    public ResponseEntity<Resource> streamSong(@PathVariable String filename) {
        try {
            Resource song = songStreamService.getSongFile(filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());

            return new ResponseEntity<>(song, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/stream/cover/{filename:.+}")
    public ResponseEntity<Resource> streamCover(@PathVariable String filename) {
        try {
            Resource cover = songStreamService.getCoverFile(filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());

            return new ResponseEntity<>(cover, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}