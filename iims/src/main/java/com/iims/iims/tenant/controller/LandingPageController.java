package com.iims.iims.tenant.controller;

import com.iims.iims.tenant.dto.LandingPageDto;
import com.iims.iims.tenant.service.LandingPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/tenants/{tenantId}/landing-page")
public class LandingPageController {
    private static final Logger logger = LoggerFactory.getLogger(LandingPageController.class);
    
    @Autowired
    private LandingPageService landingPageService;

    @Value("${landingpage.upload.dir:uploads}")
    private String uploadDir;

    // Test endpoint to verify controller accessibility
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint(@PathVariable UUID tenantId) {
        logger.info("=== TEST ENDPOINT CALLED ===");
        logger.info("Test endpoint accessed for tenant: {}", tenantId);
        return ResponseEntity.ok("Landing page controller is accessible for tenant: " + tenantId);
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        logger.info("=== HEALTH CHECK ENDPOINT CALLED ===");
        return ResponseEntity.ok("Landing page controller is healthy and running");
    }

    // Get landing page for public view
    @GetMapping("/public")
    public ResponseEntity<LandingPageDto> getPublicLandingPage(@PathVariable UUID tenantId) {
        try {
            logger.info("=== PUBLIC LANDING PAGE REQUEST ===");
            logger.info("Getting public landing page for tenant: {}", tenantId);
            logger.info("Request URI: /api/tenants/{}/landing-page/public", tenantId);
            
            LandingPageDto dto = landingPageService.getLandingPageByTenantId(tenantId);
            if (dto == null) {
                logger.warn("No landing page found for tenant: {}", tenantId);
                return ResponseEntity.notFound().build();
            }
            
            logger.info("Successfully retrieved landing page for tenant: {}", tenantId);
            logger.info("Landing page has {} sections", dto.getSections() != null ? dto.getSections().size() : 0);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error getting public landing page for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    // Get landing page for management (tenant admin)
    // @PreAuthorize("hasRole('TENANT_ADMIN')") // Temporarily commented out for debugging
    @GetMapping
    public ResponseEntity<LandingPageDto> getLandingPage(@PathVariable UUID tenantId) {
        try {
            logger.info("Getting landing page for tenant: {}", tenantId);
            LandingPageDto dto = landingPageService.getLandingPageByTenantId(tenantId);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error getting landing page for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    // Create or update landing page (tenant admin)
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @PostMapping
    public ResponseEntity<?> createOrUpdateLandingPage(@PathVariable UUID tenantId, @RequestBody LandingPageDto dto) {
        try {
            logger.info("Creating/updating landing page for tenant: {}", tenantId);
            logger.debug("Landing page data: {}", dto);
            LandingPageDto saved = landingPageService.createOrUpdateLandingPage(tenantId, dto);
            logger.info("Successfully saved landing page for tenant: {}", tenantId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error creating/updating landing page for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Delete landing page (tenant admin)
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @DeleteMapping
    public ResponseEntity<Void> deleteLandingPage(@PathVariable UUID tenantId) {
        try {
            logger.info("Deleting landing page for tenant: {}", tenantId);
            landingPageService.deleteLandingPage(tenantId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting landing page for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@PathVariable UUID tenantId, @RequestParam("file") MultipartFile file) {
        try {
            logger.info("Uploading image for tenant: {}, filename: {}", tenantId, file.getOriginalFilename());
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".") ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.')) : "";
            String filename = "tenant-" + tenantId + "-" + UUID.randomUUID() + ext;
            Path dir = Paths.get(uploadDir);
            if (!Files.exists(dir)) {
                logger.info("Creating upload directory: {}", dir);
                Files.createDirectories(dir);
            }
            Path filePath = dir.resolve(filename);
            file.transferTo(filePath);
            String url = "/uploads/" + filename;
            logger.info("Successfully uploaded image: {}", url);
            return ResponseEntity.ok(Collections.singletonMap("url", url));
        } catch (Exception e) {
            logger.error("Error uploading image for tenant {}: {}", tenantId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
        }
    }
} 