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

    @Value("${app.upload.dir:uploads/applications}")
    private String uploadDir;

    @Transactional
    public ApplicationDocumentDto uploadDocument(UUID applicationId, ApplicationDocumentRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + applicationId));

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, applicationId.toString());
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String fileExtension = StringUtils.getFilenameExtension(request.getOriginalFileName());
            String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFileName);

            // Decode and save file
            byte[] fileContent = Base64.getDecoder().decode(request.getFileContent());
            Files.write(filePath, fileContent);

            // Create document entity
            ApplicationDocument document = ApplicationDocument.builder()
                    .application(application)
                    .fileName(uniqueFileName)
                    .originalFileName(request.getOriginalFileName())
                    .filePath(filePath.toString())
                    .fileSize(request.getFileSize())
                    .contentType(request.getContentType())
                    .documentType(request.getDocumentType())
                    .description(request.getDescription())
                    .uploadedAt(LocalDateTime.now())
                    .isActive(true)
                    .build();

            ApplicationDocument savedDocument = documentRepository.save(document);

            return convertToDto(savedDocument);
        } catch (IOException e) {
            log.error("Error saving file for application {}: {}", applicationId, e.getMessage());
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
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
                .downloadUrl("/api/v1/applications/documents/" + document.getId() + "/download")
                .build();
    }
}
