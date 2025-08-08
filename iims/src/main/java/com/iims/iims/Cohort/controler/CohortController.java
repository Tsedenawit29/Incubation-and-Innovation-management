package com.iims.iims.Cohort.controler;

import com.iims.iims.Cohort.dtos.CohortDtoRequest;
import com.iims.iims.Cohort.dtos.CohortResponse;
import com.iims.iims.Cohort.services.CohortService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/cohorts")
public class CohortController {

    private final CohortService cohortService;

    public CohortController(CohortService cohortService) {
        this.cohortService = cohortService;
    }

    /**
     * Endpoint for Tenants to create a new cohort.
     * The tenantId is explicitly provided in the URI.
     *
     * @param tenantId The UUID of the tenant creating the cohort.
     * @param cohortDtoRequest The CohortDtoRequest DTO to create the Cohort.
     * @return ResponseEntity with the created CohortResponse and HTTP status 201.
     */
    @PostMapping
    public ResponseEntity<CohortResponse> createCohort(
            @PathVariable UUID tenantId,
            @Valid @RequestBody CohortDtoRequest cohortDtoRequest) {
        CohortResponse newCohort = cohortService.createCohort(tenantId, cohortDtoRequest);
        return new ResponseEntity<>(newCohort, HttpStatus.CREATED);
    }

    /**
     * Retrieves a Cohort belonging to a specific tenant by the Cohort id.
     *
     * @param tenantId The UUID of the tenant.
     * @param cohortId The UUID of the Cohort.
     * @return ResponseEntity with the CohortResponse and HTTP status 200.
     */
    @GetMapping("/{cohortId}")
    public ResponseEntity<CohortResponse> getCohortById(
            @PathVariable UUID tenantId,
            @PathVariable UUID cohortId) {
        CohortResponse cohort = cohortService.getCohortById(cohortId, tenantId);
        return ResponseEntity.ok(cohort);
    }

    /**
     * Retrieves all Cohorts belonging to a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return ResponseEntity with a list of CohortResponse and HTTP status 200.
     */
    @GetMapping
    public ResponseEntity<List<CohortResponse>> getAllCohorts(@PathVariable UUID tenantId) {
        List<CohortResponse> cohorts = cohortService.getAllCohorts(tenantId);
        return ResponseEntity.ok(cohorts);
    }

    /**
     * Updates a Cohort belonging to a specific tenant by the Cohort id.
     *
     * @param tenantId The UUID of the tenant.
     * @param cohortId The UUID of the Cohort.
     * @param cohortDtoRequest The CohortDtoRequest DTO to update the Cohort.
     * @return ResponseEntity with the updated CohortResponse and HTTP status 200.
     */
    @PutMapping("/{cohortId}")
    public ResponseEntity<CohortResponse> updateCohort(
            @PathVariable UUID tenantId,
            @PathVariable UUID cohortId,
            @Valid @RequestBody CohortDtoRequest cohortDtoRequest) {
        CohortResponse updatedCohort = cohortService.updateCohort(cohortId, tenantId, cohortDtoRequest);
        return ResponseEntity.ok(updatedCohort);
    }

    /**
     * Deletes a Cohort belonging to a specific tenant by the Cohort id.
     *
     * @param tenantId The UUID of the tenant.
     * @param cohortId The UUID of the Cohort.
     * @return ResponseEntity with no content and HTTP status 204.
     */
    @DeleteMapping("/{cohortId}")
    public ResponseEntity<Void> deleteCohort(
            @PathVariable UUID tenantId,
            @PathVariable UUID cohortId) {
        cohortService.deleteCohort(cohortId, tenantId);
        return ResponseEntity.noContent().build();
    }
}