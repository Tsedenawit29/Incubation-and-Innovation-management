package com.iims.iims.Cohort.repos;

import com.iims.iims.Cohort.entity.Cohort;
import com.iims.iims.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CohortRepo extends JpaRepository<Cohort, UUID> {

    List<Cohort> findByTenant(Tenant tenant);
    Optional<Cohort> findByIdAndTenant(UUID id, Tenant tenant);
}
