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

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public ApplicationStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ApplicationStatus newStatus) {
        this.newStatus = newStatus;
    }
}
