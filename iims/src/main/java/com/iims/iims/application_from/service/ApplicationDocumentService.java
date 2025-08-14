package com.iims.iims.application_from.service;

import com.iims.iims.application_from.dto.ApplicationDocumentDto;
import com.iims.iims.application_from.dto.ApplicationDocumentRequest;
import com.iims.iims.application_from.entity.Application;
import com.iims.iims.application_from.entity.ApplicationDocument;
import com.iims.iims.application_from.repository.ApplicationDocumentRepository;
import com.iims.iims.application_from.repository.ApplicationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationDocumentService {

    private final ApplicationDocumentRepository documentRepository;
    private final ApplicationRepository applicationRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public ApplicationDocumentDto uploadDocument(UUID applicationId, ApplicationDocumentRequest request) {
        // DEPRECATED: This method uses Base64 encoding which causes file corruption
        // Use uploadMultipartFile() method instead for proper file storage
        throw new UnsupportedOperationException("Base64 file upload is deprecated. Use uploadMultipartFile() method instead.");
    }

    /**
     * Upload actual MultipartFile (like progress tracking system)
     */
    @Transactional
    public ApplicationDocumentDto uploadMultipartFile(UUID applicationId, org.springframework.web.multipart.MultipartFile file, String documentType, String description) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + applicationId));

        try {
            // Create upload directory for applicants if it doesn't exist
            String uploadDirPath = "uploads/applicants/";
            Files.createDirectories(Paths.get(uploadDirPath));

            // Generate unique filename like progress tracking system
            String filename = applicationId + "-" + System.currentTimeMillis() + "-" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDirPath, filename);

            // Store actual file bytes (like progress tracking system)
            Files.write(filePath, file.getBytes());

            // Create document entity
            ApplicationDocument document = ApplicationDocument.builder()
                    .application(application)
                    .fileName(filename)
                    .originalFileName(file.getOriginalFilename())
                    .filePath(filePath.toString())
                    .fileUrl("http://localhost:8081/api/v1/files/applicants/" + filename)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .documentType(documentType)
                    .description(description)
                    .uploadedAt(LocalDateTime.now())
                    .isActive(true)
                    .build();

            ApplicationDocument savedDocument = documentRepository.save(document);

            return convertToDto(savedDocument);
        } catch (IOException e) {
            log.error("Error saving multipart file for application {}: {}", applicationId, e.getMessage());
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    /**
     * Saves document metadata when file is already stored.
     * Used when actual file is stored separately and we only need to save metadata with file URL.
     *
     * @param applicationId The application ID
     * @param fileName The stored filename
     * @param originalFileName The original filename
     * @param filePath The file path
     * @param fileUrl The file URL
     * @param fileSize The file size
     * @param contentType The content type
     * @param documentType The document type
     * @param description The description
     * @return ApplicationDocumentDto
     */
    @Transactional
    public ApplicationDocumentDto saveDocumentMetadata(
            UUID applicationId, 
            String fileName, 
            String originalFileName,
            String filePath,
            String fileUrl,
            Long fileSize,
            String contentType,
            String documentType,
            String description) {
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + applicationId));

        // Create document entity with metadata only
        ApplicationDocument document = ApplicationDocument.builder()
                .application(application)
                .fileName(fileName)
                .originalFileName(originalFileName)
                .filePath(filePath)
                .fileUrl(fileUrl) // Store the file URL
                .fileSize(fileSize)
                .contentType(contentType)
                .documentType(documentType)
                .description(description)
                .uploadedAt(LocalDateTime.now())
                .isActive(true)
                .build();

        ApplicationDocument savedDocument = documentRepository.save(document);
        return convertToDto(savedDocument);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDocumentDto> getApplicationDocuments(UUID applicationId) {
        List<ApplicationDocument> documents = documentRepository.findByApplicationIdAndIsActiveTrue(applicationId);
        return documents.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDocumentDto getDocumentById(UUID documentId) {
        ApplicationDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with ID: " + documentId));
        return convertToDto(document);
    }

    @Transactional
    public void deleteDocument(UUID documentId) {
        ApplicationDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with ID: " + documentId));

        // Soft delete
        document.setIsActive(false);
        documentRepository.save(document);

        // Optionally delete physical file
        try {
            Path filePath = Paths.get(document.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            log.warn("Could not delete physical file: {}", document.getFilePath());
        }
    }

    @Transactional(readOnly = true)
    public byte[] downloadDocument(UUID documentId) throws IOException {
        ApplicationDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with ID: " + documentId));

        Path filePath = Paths.get(document.getFilePath());
        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found on disk: " + document.getFilePath());
        }

        return Files.readAllBytes(filePath);
    }

    private ApplicationDocumentDto convertToDto(ApplicationDocument document) {
        return ApplicationDocumentDto.builder()
                .id(document.getId())
                .applicationId(document.getApplication().getId())
                .fileName(document.getFileName())
                .originalFileName(document.getOriginalFileName())
                .filePath(document.getFilePath())
                .fileSize(document.getFileSize())
                .contentType(document.getContentType())
                .documentType(document.getDocumentType())
                .description(document.getDescription())
                .uploadedAt(document.getUploadedAt())
                .isActive(document.getIsActive())
                .downloadUrl("http://localhost:8081/api/v1/files/applicants/" + document.getFileName())
                .build();
    }
}
