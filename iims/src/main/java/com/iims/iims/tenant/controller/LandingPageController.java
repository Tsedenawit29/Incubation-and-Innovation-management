package com.iims.iims.tenant.controller;

import com.iims.iims.tenant.dto.LandingPageDto;
import com.iims.iims.tenant.service.LandingPageService;
import com.iims.iims.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants/{tenantId}/landing-page")
@CrossOrigin(origins = "http://localhost:3000")
public class LandingPageController {

    @Autowired
    private LandingPageService landingPageService;

    @GetMapping
    public ResponseEntity<LandingPageDto> getLandingPage(
            @PathVariable UUID tenantId,
            @AuthenticationPrincipal User user) {
        try {
            LandingPageDto landingPage = landingPageService.getLandingPageByTenantId(tenantId);
            if (landingPage == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(landingPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/public")
    public ResponseEntity<LandingPageDto> getPublicLandingPage(@PathVariable UUID tenantId) {
        try {
            LandingPageDto landingPage = landingPageService.getLandingPageByTenantId(tenantId);
            if (landingPage == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(landingPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<LandingPageDto> saveLandingPage(
            @PathVariable UUID tenantId,
            @RequestBody LandingPageDto landingPageDto,
            @AuthenticationPrincipal User user) {
        try {
            LandingPageDto savedLandingPage = landingPageService.createOrUpdateLandingPage(tenantId, landingPageDto);
            return ResponseEntity.ok(savedLandingPage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteLandingPage(
            @PathVariable UUID tenantId,
            @AuthenticationPrincipal User user) {
        try {
            landingPageService.deleteLandingPage(tenantId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable UUID tenantId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            String imageUrl = landingPageService.uploadImage(tenantId, file);
            Map<String, String> response = new HashMap<>();
            response.put("url", "http://localhost:8081" + imageUrl);
            response.put("imageUrl", "http://localhost:8081" + imageUrl);
            response.put("filePath", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}