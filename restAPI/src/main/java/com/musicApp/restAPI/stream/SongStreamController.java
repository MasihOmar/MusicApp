package com.musicApp.restAPI.stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class SongStreamController {

    @Autowired
    private SongStreamService songStreamService;

    @GetMapping("/stream/song/{id}")
    public ResponseEntity<Resource> streamSong(@PathVariable int id) {
        try {
            Resource song = songStreamService.getSongFile(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.attachment().filename(id + ".mp3").build());

            return new ResponseEntity<>(song, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/stream/cover/{id}")
    public ResponseEntity<Resource> streamCover(@PathVariable int id) {
        try {
            Resource cover = songStreamService.getCoverFile(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentDisposition(ContentDisposition.inline().filename(id + ".jpeg").build());

            return new ResponseEntity<>(cover, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}