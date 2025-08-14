package com.iims.iims.application_from.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = "*")
public class FileController {

    @GetMapping("/applicants/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            // Get file path from uploads/applicants directory
            Path filePath = Paths.get("uploads", "applicants", filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Try to determine file's content type
                String contentType = null;
                try {
                    contentType = java.nio.file.Files.probeContentType(filePath);
                } catch (IOException ex) {
                    // Fallback to default content type
                }

                // Fallback to the default content type if type could not be determined
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                        .header(HttpHeaders.PRAGMA, "no-cache")
                        .header(HttpHeaders.EXPIRES, "0")
                        .header("X-Frame-Options", "SAMEORIGIN")
                        .header("Access-Control-Allow-Origin", "*")
                        .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                        .header("Access-Control-Allow-Headers", "*")
                        .body(resource);
            } else {
                System.out.println("File not found or not readable: " + filePath.toString());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            System.out.println("Error serving file: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/applicants")
    public ResponseEntity<java.util.List<String>> listApplicantFiles() {
        try {
            Path applicantsPath = Paths.get("uploads", "applicants");
            if (!java.nio.file.Files.exists(applicantsPath)) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }

            java.util.List<String> fileNames = java.nio.file.Files.list(applicantsPath)
                    .filter(java.nio.file.Files::isRegularFile)
                    .map(path -> path.getFileName().toString())
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(fileNames);
        } catch (Exception ex) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
}
