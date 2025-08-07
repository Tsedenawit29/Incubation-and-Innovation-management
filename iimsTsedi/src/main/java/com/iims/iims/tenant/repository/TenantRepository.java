package com.iims.iims.tenant.repository;

import com.iims.iims.tenant.entity.Tenant;
import com.iims.iims.tenant.entity.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    
    List<Tenant> findByStatus(TenantStatus status);
    
    Optional<Tenant> findByEmail(String email);
    
    Optional<Tenant> findByName(String name);
    
    boolean existsByEmail(String email);
    
    boolean existsByName(String name);
} 