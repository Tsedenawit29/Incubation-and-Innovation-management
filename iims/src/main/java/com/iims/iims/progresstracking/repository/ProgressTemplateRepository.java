package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface ProgressTemplateRepository extends JpaRepository<ProgressTemplate, UUID> {
    List<ProgressTemplate> findByTenant_Id(UUID tenantId);
} 