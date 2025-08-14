package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressTemplateAssignment;
import com.iims.iims.progresstracking.repository.ProgressTemplateAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProgressTemplateAssignmentService {
    @Autowired
    private ProgressTemplateAssignmentRepository assignmentRepo;

    public ProgressTemplateAssignment assignTemplate(ProgressTemplateAssignment assignment) {
        assignment.setId(UUID.randomUUID());
        assignment.setAssignedAt(LocalDateTime.now());
        return assignmentRepo.save(assignment);
    }

    public List<ProgressTemplateAssignment> getAssignmentsByTemplate(UUID templateId) {
        return assignmentRepo.findByTemplateId(templateId);
    }

    public List<ProgressTemplateAssignment> getAssignmentsByAssignedTo(UUID assignedToId, String assignedToType) {
        return assignmentRepo.findByAssignedToIdAndAssignedToType(assignedToId, assignedToType);
    }
} 