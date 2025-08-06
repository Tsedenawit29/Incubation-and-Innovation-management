package com.iims.iims.Industry.service;

import com.iims.iims.Industry.dto.IndustryRequest;
import com.iims.iims.Industry.dto.IndustryResponse;
import com.iims.iims.Industry.entity.Industry;
import com.iims.iims.Industry.repo.IndustryRepository;
import com.iims.iims.tenant.entity.Tenant;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IndustryService {

    private final IndustryRepository industryRepository;

    public IndustryService(IndustryRepository industryRepository) {
        this.industryRepository = industryRepository;
    }

    // Helper method to create a Tenant object from an ID
    private Tenant getTenantFromId(UUID tenantId) {
        // This assumes the tenantId is valid. In a real-world app, you would
        // use a TenantService or similar logic to fetch and validate the tenant.
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        return tenant;
    }

    /**
     * Creates a new industry for a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @param request The DTO containing the industry data.
     * @return The created IndustryResponse DTO.
     */
    public IndustryResponse createIndustry(UUID tenantId, IndustryRequest request) {
        Tenant tenant = getTenantFromId(tenantId);

        Industry industry = new Industry();
        industry.setTenant(tenant);
        industry.setName(request.getName());
        industry.setDescription(request.getDescription());

        Industry savedIndustry = industryRepository.save(industry);
        return mapToIndustryResponse(savedIndustry);
    }

    /**
     * Retrieves a specific industry belonging to a tenant by its ID.
     *
     * @param industryId The UUID of the industry.
     * @param tenantId The UUID of the tenant.
     * @return The IndustryResponse DTO for the found industry.
     * @throws EntityNotFoundException if the industry is not found for the given tenant.
     */
    public IndustryResponse getIndustryById(UUID industryId, UUID tenantId) {
        Tenant tenant = getTenantFromId(tenantId);

        Industry industry = industryRepository.findByIdAndTenant(industryId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found with id: " + industryId + " for this tenant."));

        return mapToIndustryResponse(industry);
    }

    /**
     * Retrieves all industries belonging to a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return A list of IndustryResponse DTOs.
     */
    public List<IndustryResponse> getAllIndustries(UUID tenantId) {
        Tenant tenant = getTenantFromId(tenantId);

        List<Industry> industries = industryRepository.findByTenant(tenant);
        return industries.stream()
                .map(this::mapToIndustryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates an industry belonging to a specific tenant by its ID.
     *
     * @param industryId The UUID of the industry.
     * @param tenantId The UUID of the tenant.
     * @param request The DTO containing the updated industry data.
     * @return The updated IndustryResponse DTO.
     * @throws EntityNotFoundException if the industry is not found for the given tenant.
     */
    public IndustryResponse updateIndustry(UUID industryId, UUID tenantId, IndustryRequest request) {
        Tenant tenant = getTenantFromId(tenantId);

        Industry existingIndustry = industryRepository.findByIdAndTenant(industryId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found with id: " + industryId + " for this tenant."));

        existingIndustry.setName(request.getName());
        existingIndustry.setDescription(request.getDescription());

        Industry updatedIndustry = industryRepository.save(existingIndustry);
        return mapToIndustryResponse(updatedIndustry);
    }

    /**
     * Deletes an industry belonging to a specific tenant by its ID.
     *
     * @param industryId The UUID of the industry.
     * @param tenantId The UUID of the tenant.
     * @throws EntityNotFoundException if the industry is not found for the given tenant.
     */
    public void deleteIndustry(UUID industryId, UUID tenantId) {
        Tenant tenant = getTenantFromId(tenantId);

        Industry existingIndustry = industryRepository.findByIdAndTenant(industryId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found with id: " + industryId + " for this tenant."));

        industryRepository.delete(existingIndustry);
    }

    // Helper method to map an Industry entity to an IndustryResponse DTO
    private IndustryResponse mapToIndustryResponse(Industry industry) {
        IndustryResponse response = new IndustryResponse();
        response.setId(industry.getId());
        response.setTenantId(industry.getTenant().getId());
        response.setName(industry.getName());
        response.setDescription(industry.getDescription());
        return response;
    }
}