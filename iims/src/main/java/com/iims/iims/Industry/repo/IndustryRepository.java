package com.iims.iims.Industry.repo;

import com.iims.iims.Industry.entity.Industry;
import com.iims.iims.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IndustryRepository extends JpaRepository<Industry, UUID> {

    // Find all industries belonging to a specific tenant
    List<Industry> findByTenant(Tenant tenant);

    // Find a specific industry by its ID and tenant
    Optional<Industry> findByIdAndTenant(UUID id, Tenant tenant);
}