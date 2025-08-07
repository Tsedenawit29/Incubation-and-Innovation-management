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

@RestController
@RequestMapping("/api/tenants/{tenantId}/landing-page")
public class LandingPageController {
    @Autowired
    private LandingPageService landingPageService;

    @Value("${landingpage.upload.dir:uploads}")
    private String uploadDir;

    // Get landing page for public view
    @GetMapping("/public")
    public ResponseEntity<LandingPageDto> getPublicLandingPage(@PathVariable UUID tenantId) {
        LandingPageDto dto = landingPageService.getLandingPageByTenantId(tenantId);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    // Get landing page for management (tenant admin)
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @GetMapping
    public ResponseEntity<LandingPageDto> getLandingPage(@PathVariable UUID tenantId) {
        LandingPageDto dto = landingPageService.getLandingPageByTenantId(tenantId);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    // Create or update landing page (tenant admin)
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @PostMapping
    public ResponseEntity<LandingPageDto> createOrUpdateLandingPage(@PathVariable UUID tenantId, @RequestBody LandingPageDto dto) {
        LandingPageDto saved = landingPageService.createOrUpdateLandingPage(tenantId, dto);
        return ResponseEntity.ok(saved);
    }

    // Delete landing page (tenant admin)
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @DeleteMapping
    public ResponseEntity<Void> deleteLandingPage(@PathVariable UUID tenantId) {
        landingPageService.deleteLandingPage(tenantId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@PathVariable UUID tenantId, @RequestParam("file") MultipartFile file) {
        try {
            String ext = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".") ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.')) : "";
            String filename = "tenant-" + tenantId + "-" + UUID.randomUUID() + ext;
            Path dir = Paths.get(uploadDir);
            if (!Files.exists(dir)) Files.createDirectories(dir);
            Path filePath = dir.resolve(filename);
            file.transferTo(filePath);
            String url = "/uploads/" + filename;
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
        }
    }
} 