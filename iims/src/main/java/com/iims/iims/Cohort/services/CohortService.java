package com.iims.iims.Cohort.services;

import com.iims.iims.Cohort.dtos.CohortDtoRequest;
import com.iims.iims.Cohort.dtos.CohortResponse;
import com.iims.iims.Cohort.entity.Cohort;
import com.iims.iims.Cohort.repos.CohortRepo;
import com.iims.iims.tenant.entity.Tenant;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CohortService {

    private final CohortRepo cohortRepo;

    public CohortService(CohortRepo cohortRepo) {
        this.cohortRepo = cohortRepo;
    }

    // Helper method to create a Tenant object from an ID
    private Tenant getTenantFromId(UUID tenantId) {
        // You would typically use a TenantService to fetch the actual Tenant entity
        // or validate that the tenantId exists. For this example, we create a
        // simple Tenant object to use in the repository methods.
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        return tenant;
    }

    public CohortResponse createCohort(UUID tenantId, CohortDtoRequest cohortDtoRequest) {
        Tenant tenant = getTenantFromId(tenantId);

        Cohort cohort = new Cohort();
        cohort.setName(cohortDtoRequest.getName());
        cohort.setDescription(cohortDtoRequest.getDescription());
        cohort.setStartDate(cohortDtoRequest.getStartDate());
        cohort.setEndDate(cohortDtoRequest.getEndDate());
        cohort.setActive(true);
        cohort.setTenant(tenant);

        Cohort savedCohort = cohortRepo.save(cohort);
        return mapToCohortResponse(savedCohort);
    }

    public CohortResponse getCohortById(UUID cohortId, UUID tenantId) {
        Tenant tenant = getTenantFromId(tenantId);

        Cohort cohort = cohortRepo.findByIdAndTenant(cohortId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Cohort not found with id: " + cohortId + " for this tenant."));

        return mapToCohortResponse(cohort);
    }

    public List<CohortResponse> getAllCohorts(UUID tenantId) {
        Tenant tenant = getTenantFromId(tenantId);

        List<Cohort> cohorts = cohortRepo.findByTenant(tenant);
        return cohorts.stream()
                .map(this::mapToCohortResponse)
                .collect(Collectors.toList());
    }

    public CohortResponse updateCohort(UUID cohortId, UUID tenantId, CohortDtoRequest cohortDtoRequest) {
        Tenant tenant = getTenantFromId(tenantId);

        Cohort existingCohort = cohortRepo.findByIdAndTenant(cohortId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Cohort not found with id: " + cohortId + " for this tenant."));

        existingCohort.setName(cohortDtoRequest.getName());
        existingCohort.setDescription(cohortDtoRequest.getDescription());
        existingCohort.setStartDate(cohortDtoRequest.getStartDate());
        existingCohort.setEndDate(cohortDtoRequest.getEndDate());
        if (cohortDtoRequest.getActive() != null) {
            existingCohort.setActive(cohortDtoRequest.getActive());
        }

        Cohort updatedCohort = cohortRepo.save(existingCohort);
        return mapToCohortResponse(updatedCohort);
    }

    public void deleteCohort(UUID cohortId, UUID tenantId) {
        Tenant tenant = getTenantFromId(tenantId);

        Cohort existingCohort = cohortRepo.findByIdAndTenant(cohortId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Cohort not found with id: " + cohortId + " for this tenant."));

        cohortRepo.delete(existingCohort);
    }

    // Helper method to map a Cohort entity to a CohortResponse DTO
    private CohortResponse mapToCohortResponse(Cohort cohort) {
        CohortResponse response = new CohortResponse();
        response.setId(cohort.getId());
        response.setTenantId(cohort.getTenant().getId());
        response.setName(cohort.getName());
        response.setDescription(cohort.getDescription());
        response.setActive(cohort.getActive());
        response.setStartDate(cohort.getStartDate());
        response.setEndDate(cohort.getEndDate());
        return response;
    }
}