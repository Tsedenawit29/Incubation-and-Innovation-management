package com.iims.iims.application_from.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFieldResponseDto {

    private UUID fieldId;
    private String fieldLabel;
    private String response;

    public ApplicationFieldResponseDto(
            UUID id,
            String label,
            String response) {

    }
}
