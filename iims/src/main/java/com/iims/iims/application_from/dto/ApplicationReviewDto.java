package com.iims.iims.application_from.dto;

import com.iims.iims.application_from.entity.ApplicationStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationReviewDto {

    @NotNull(message = "Application ID cannot be null")
    private UUID applicationId;

    @NotNull(message = "New status cannot be null")
    private ApplicationStatus newStatus;
}
