package com.iims.iims.application_from.repository;

import com.iims.iims.application_from.entity.ApplicationForm;
import com.iims.iims.application_from.entity.ApplicationFormType;
import com.iims.iims.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationFormRepository extends JpaRepository<ApplicationForm, UUID> {

    List<ApplicationForm> findByTenant(Tenant tenant);
    Optional<ApplicationForm> findByIdAndTenant(UUID id, Tenant tenant);
    List<ApplicationForm> findByTenantAndIsActive(Tenant tenant, ApplicationFormType type, Boolean isActive);
}
