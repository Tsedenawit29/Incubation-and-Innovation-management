package com.iims.iims.application_from.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFieldResponseRequest {

    @NotNull(message = "Field ID cannot be null")
    private UUID fieldId;

    private String response;
}
