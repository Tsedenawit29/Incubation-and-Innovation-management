package com.iims.iims.application_from.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocumentDto {

    private UUID id;
    private UUID applicationId;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private Long fileSize;
    private String contentType;
    private String documentType;
    private String description;
    private LocalDateTime uploadedAt;
    private Boolean isActive;
    private String downloadUrl; // For frontend to download the file
}
