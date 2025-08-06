package com.iims.iims.Cohort.dtos;

import com.iims.iims.tenant.entity.Tenant;


import java.time.LocalDate;
import java.util.UUID;

public class CohortResponse {

    private UUID id;
    private Tenant tenantId;
    private String name;
    private String description;
    private Boolean isActive;
    private LocalDate startDate;
    private LocalDate endDate;
}
