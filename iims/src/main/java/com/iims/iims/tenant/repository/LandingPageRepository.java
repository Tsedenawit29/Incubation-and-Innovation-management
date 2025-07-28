package com.iims.iims.tenant.repository;

import com.iims.iims.tenant.entity.LandingPage;
import com.iims.iims.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface LandingPageRepository extends JpaRepository<LandingPage, Long> {
    Optional<LandingPage> findByTenant(Tenant tenant);
    Optional<LandingPage> findByTenantId(UUID tenantId);
} 