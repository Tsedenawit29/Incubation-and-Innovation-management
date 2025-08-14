package com.iims.iims.application_from.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocumentRequest {

    @NotBlank(message = "File name cannot be empty")
    private String fileName;

    @NotBlank(message = "Original file name cannot be empty")
    private String originalFileName;

    @NotBlank(message = "File content cannot be empty")
    private String fileContent; // Base64 encoded file content

    @NotNull(message = "File size cannot be null")
    private Long fileSize;

    @NotBlank(message = "Content type cannot be empty")
    private String contentType;

    private String documentType; // e.g., "PITCH_DECK", "BUSINESS_PLAN", "FINANCIAL_STATEMENTS"

    private String description;
}
