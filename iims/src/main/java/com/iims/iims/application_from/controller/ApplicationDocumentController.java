package com.iims.iims.application_from.controller;

import com.iims.iims.application_from.dto.ApplicationDocumentDto;
import com.iims.iims.application_from.dto.ApplicationDocumentRequest;
import com.iims.iims.application_from.service.ApplicationDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ApplicationDocumentController {

    private final ApplicationDocumentService documentService;

    @PostMapping("/{applicationId}/documents")
    public ResponseEntity<ApplicationDocumentDto> uploadDocument(
            @PathVariable UUID applicationId,
            @RequestBody ApplicationDocumentRequest request) {
        ApplicationDocumentDto uploadedDocument = documentService.uploadDocument(applicationId, request);
        return new ResponseEntity<>(uploadedDocument, HttpStatus.CREATED);
    }

    @GetMapping("/{applicationId}/documents")
    public ResponseEntity<List<ApplicationDocumentDto>> getApplicationDocuments(
            @PathVariable UUID applicationId) {
        List<ApplicationDocumentDto> documents = documentService.getApplicationDocuments(applicationId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/documents/{documentId}")
    public ResponseEntity<ApplicationDocumentDto> getDocumentById(
            @PathVariable UUID documentId) {
        ApplicationDocumentDto document = documentService.getDocumentById(documentId);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<ByteArrayResource> downloadDocument(
            @PathVariable UUID documentId) {
        try {
            byte[] fileContent = documentService.downloadDocument(documentId);
            ApplicationDocumentDto document = documentService.getDocumentById(documentId);
            
            ByteArrayResource resource = new ByteArrayResource(fileContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + document.getOriginalFileName() + "\"")
                    .contentType(MediaType.parseMediaType(document.getContentType()))
                    .contentLength(fileContent.length)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}
