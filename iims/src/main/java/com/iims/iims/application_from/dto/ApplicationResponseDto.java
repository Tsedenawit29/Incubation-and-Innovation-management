package com.iims.iims.application_from.dto;

import com.iims.iims.application_from.entity.ApplicantType;
import com.iims.iims.application_from.entity.ApplicationStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {

    private UUID id;
    private UUID formId;
    private UUID tenantId;
    private String email;
    private String firstName;
    private String lastName;
    private ApplicantType applicantType;
    private ApplicationStatus status;
    private LocalDateTime submittedAt;
    private List<ApplicationResponseDto> fieldResponses;
}
