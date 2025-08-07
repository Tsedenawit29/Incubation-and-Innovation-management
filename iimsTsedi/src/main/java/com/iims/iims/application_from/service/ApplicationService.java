package com.iims.iims.application_from.service;

import com.iims.iims.application_from.dto.ApplicationFieldResponseDto;
import com.iims.iims.application_from.dto.ApplicationResponseDto;
import com.iims.iims.application_from.dto.ApplicationReviewDto;
import com.iims.iims.application_from.dto.SubmitApplicationRequest;
import com.iims.iims.application_from.entity.*;
import com.iims.iims.application_from.repository.ApplicationFormRepository;
import com.iims.iims.application_from.repository.ApplicationRepository;
import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final ApplicationFormRepository applicationFormRepository;
    private final TenantRepository tenantRepository;

    @Autowired
    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApplicationFormRepository applicationFormRepository,
            TenantRepository tenantRepository){
        this.applicationRepository = applicationRepository;
        this.applicationFormRepository = applicationFormRepository;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Submits a new application based on a given form.
     * Validates responses against the form's required fields.
     *
     * @param submitRequest The SubmitApplicationRequest DTO containing application details and responses.
     * @return The created ApplicationResponseDto.
     * @throws EntityNotFoundException if the form is not found.
     * @throws IllegalArgumentException if required fields are missing or field IDs are invalid.
     */
    @Transactional
    public ApplicationResponseDto submitApplication(SubmitApplicationRequest submitRequest) {
        ApplicationForm form = applicationFormRepository.findById(submitRequest.getFormId())
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + submitRequest.getFormId()));
        // Ensure the form is active before allowing submissions
        if (!form.getActive()) {
            throw new IllegalArgumentException("Cannot submit to an inactive form.");
        }
        Application application = new Application();
        application.setForm(form);
        application.setTenant(form.getTenant());
        application.setEmail(submitRequest.getEmail());
        application.setFirst_name(submitRequest.getFirstName());
        application.setLast_name(submitRequest.getLastName());
        application.setApplicantType(submitRequest.getApplicantType());
        application.setStatus(ApplicationStatus.PENDING);

        // Map form fields by ID for quick lookup and validation
        Map<UUID, ApplicationFormField> formFieldsMap = form.getFields().stream()
                .collect(Collectors.toMap(ApplicationFormField::getId, Function.identity()));

        List<ApplicationResponse> responses = submitRequest.getFieldResponses().stream()
                .map(responseDto -> {
                    ApplicationFormField field = formFieldsMap.get(responseDto.getFieldId());
                    if (field == null) {
                        throw new IllegalArgumentException("Invalid field ID provided: " + responseDto.getFieldId());
                    }
                    ApplicationResponse response = new ApplicationResponse();
                    response.setApplication(application);
                    response.setField(field);
                    response.setResponse(responseDto.getResponse());
                    return response;
                })
                .collect(Collectors.toList());

        // Validate required fields
        for (ApplicationFormField formField : form.getFields()) {
            if (formField.getIsRequired()) {
                boolean hasResponse = responses.stream()
                        .anyMatch(appResponse -> appResponse.getField().getId().equals(formField.getId()) &&
                                appResponse.getResponse() != null && !appResponse.getResponse().trim().isEmpty());
                if (!hasResponse) {
                    throw new IllegalArgumentException("Required field '" + formField.getLabel() + "' (ID: " + formField.getId() + ") is missing a response.");
                }
            }
        }

        application.setResponses(responses);
        Application savedApplication = applicationRepository.save(application);
        return convertToDto(savedApplication);
    }
    /**
     * Retrieves a specific application by its ID and tenant ID.
     *
     * @param applicationId The UUID of the application.
     * @param tenantId The UUID of the tenant.
     * @return The ApplicationResponseDto.
     * @throws EntityNotFoundException if the tenant or application is not found for the given tenant.
     */
    @Transactional(readOnly = true)
    public ApplicationResponseDto getApplicationById(UUID applicationId, UUID tenantId){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));
        Application application = applicationRepository.findByIdAndTenant(applicationId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + applicationId + " for tenant: " + tenantId));
        return convertToDto(application);
    }

    /**
     * Retrieves all applications submitted for a specific form, filtered by tenant.
     *
     * @param formId   The UUID of the form.
     * @param tenantId The UUID of the tenant.
     * @return A list of ApplicationResponseDto.
     * @throws EntityNotFoundException if the tenant or form does not exist for the given tenant.
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getApplicationsByFormId(UUID formId, UUID tenantId){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));

        //First, verify the form exists and belongs to the tenant
        applicationFormRepository.findByIdAndTenant(formId, tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application form not found with ID: " + formId + " for tenant: " + tenantId));

        List<Application> applications = applicationRepository.findByFormId(formId);
        // Filter applications to ensure they belong to the same tenant as the form (redundant if using findByTenant, but good for safety)
        return applications.stream()
                .filter(app -> app.getTenant().getId().equals(tenantId))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all applications belonging to a specific tenant.
     *
     * @param tenantId The UUID of the tenant.
     * @return A list of ApplicationResponseDto.
     * @throws EntityNotFoundException if the tenant is not found.
     */
    @Transactional(readOnly = true)
    public List<ApplicationResponseDto> getAllApplicationsByTenant(UUID tenantId){
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));

        List<Application> applications = applicationRepository.findByTenant(tenant);
        return applications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    /**
     * Updates the status of an application.
     *
     * @param reviewDto The ApplicationReviewDto containing application ID and new status.
     * @param tenantId  The UUID of the tenant performing the review.
     * @return The updated ApplicationResponseDto.
     * @throws EntityNotFoundException if the tenant or application is not found for the given tenant.
     */
    @Transactional
    public ApplicationResponseDto updateApplicationStatus(ApplicationReviewDto reviewDto, UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with ID: " + tenantId));

        Application application = applicationRepository.findByIdAndTenant(reviewDto.getApplicationId(), tenant)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with ID: " + reviewDto.getApplicationId() + " for tenant: " + tenantId));

        application.setStatus(reviewDto.getNewStatus());
        Application updatedApplication = applicationRepository.save(application);
        return convertToDto(updatedApplication);
    }

    /**
     * Helper method to convert an Application entity to its DTO representation.
     *
     * @param application The Application entity.
     * @return The ApplicationResponseDto.
     */
    private ApplicationResponseDto convertToDto(Application application) {
        // CORRECTED: This list should be of type ApplicationFieldResponseDto
        List<ApplicationFieldResponseDto> fieldResponseDtos = application.getResponses().stream()
                // CORRECTED: Create an ApplicationFieldResponseDto here
                .map(response -> new ApplicationFieldResponseDto(
                        response.getField().getId(),
                        response.getField().getLabel(), // Include field label for better context
                        response.getResponse()
                ))
                .collect(Collectors.toList());

        return new ApplicationResponseDto(
                application.getId(),
                application.getForm().getId(),
                application.getTenant().getId(), // Get tenantId from the Tenant entity
                application.getEmail(),
                application.getFirst_name(),
                application.getLast_name(),// Changed from getFirst_name() to getFullName()
                application.getApplicantType(),
                application.getStatus(),
                application.getSubmittedAt(),
                fieldResponseDtos
        );
    }
}
