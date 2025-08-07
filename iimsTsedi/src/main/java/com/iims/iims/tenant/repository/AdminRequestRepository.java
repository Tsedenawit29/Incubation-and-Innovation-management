package com.iims.iims.tenant.repository;

import com.iims.iims.tenant.entity.AdminRequest;
import com.iims.iims.tenant.entity.AdminRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminRequestRepository extends JpaRepository<AdminRequest, UUID> {
    
    List<AdminRequest> findByStatus(AdminRequestStatus status);
    
    List<AdminRequest> findByTenantId(UUID tenantId);
    
    List<AdminRequest> findByTenantIdAndStatus(UUID tenantId, AdminRequestStatus status);
    
    Optional<AdminRequest> findByEmail(String email);
    
    boolean existsByEmail(String email);
} 