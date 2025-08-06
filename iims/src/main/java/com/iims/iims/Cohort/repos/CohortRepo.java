package com.iims.iims.Cohort.repos;

import com.iims.iims.Cohort.entity.Cohort;
import com.iims.iims.application_from.entity.Application;
import com.iims.iims.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CohortRepo extends JpaRepository<Cohort, UUID> {

    List<Application> findByCohortId(UUID cohortId);
    List<Application> findByTenant(Tenant tenant);
    Optional<Application> findByIdAndTenant(UUID id, Tenant tenant);
}
