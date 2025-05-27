package com.musicApp.restAPI.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for testing public endpoints
 */
@RestController
@RequestMapping("/public")
public class PublicController {

    @GetMapping("/test")
    public Map<String, Object> testGet() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Public GET endpoint is working");
        return response;
    }
    
    @PostMapping("/test")
    public ResponseEntity<?> testPost(@RequestBody(required = false) Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Public POST endpoint is working");
        if (request != null) {
            response.put("receivedData", request);
        }
        return ResponseEntity.ok(response);
    }
} 