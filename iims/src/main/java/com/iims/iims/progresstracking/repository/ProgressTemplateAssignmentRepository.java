package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressTemplateAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProgressTemplateAssignmentRepository extends JpaRepository<ProgressTemplateAssignment, UUID> {
    List<ProgressTemplateAssignment> findByTemplateId(UUID templateId);
    List<ProgressTemplateAssignment> findByAssignedToIdAndAssignedToType(UUID assignedToId, String assignedToType);
} 