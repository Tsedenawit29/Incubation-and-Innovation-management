package com.iims.iims.application_from.dto;

import com.iims.iims.Cohort.entity.Cohort;
import com.iims.iims.Industry.entity.Industry;
import com.iims.iims.application_from.entity.ApplicationFormType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationFormResponseDto {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private UUID cohortId;
    private UUID industryId;
    private ApplicationFormType type;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<ApplicationFormFieldDto> fields;
}
