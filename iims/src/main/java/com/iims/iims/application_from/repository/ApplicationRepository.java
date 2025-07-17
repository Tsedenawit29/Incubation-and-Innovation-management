package com.iims.iims.application_from.repository;

import com.iims.iims.application_from.entity.Application;
import com.iims.iims.application_from.entity.ApplicationStatus;
import com.iims.iims.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    List<Application> findByRormId(UUID formId);
    List<Application> findByTenant(Tenant tenant);
    List<Application> findByTenantAndStatus(Tenant tenant, ApplicationStatus status);
    Optional<Application> findByIdAndTenant(UUID id, Tenant tenant);
}
