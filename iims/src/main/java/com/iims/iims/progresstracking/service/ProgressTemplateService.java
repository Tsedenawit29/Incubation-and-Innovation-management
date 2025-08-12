package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressTemplate;
import com.iims.iims.progresstracking.entity.ProgressPhase;
import com.iims.iims.progresstracking.entity.ProgressTask;
import com.iims.iims.progresstracking.entity.ProgressSubmission;
import com.iims.iims.progresstracking.repository.ProgressTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressTemplateService {
    @Autowired
    private ProgressTemplateRepository templateRepo;
    
    @Autowired
    private ProgressPhaseService phaseService;
    
    @Autowired
    private ProgressTaskService taskService;
    
    @Autowired
    private ProgressSubmissionService submissionService;
    
    @Autowired
    private ProgressTemplateAssignmentService assignmentService;

    public ProgressTemplate createTemplate(ProgressTemplate template) {
        template.setId(UUID.randomUUID());
        template.setCreatedAt(LocalDateTime.now());
        return templateRepo.save(template);
    }

    public List<ProgressTemplate> getAllTemplates() {
        return templateRepo.findAll();
    }

    public Optional<ProgressTemplate> getTemplateById(UUID id) {
        return templateRepo.findById(id);
    }

    public ProgressTemplate updateTemplate(ProgressTemplate template) {
        return templateRepo.save(template);
    }

    /**
     * Delete template with proper cascading deletion of all related entities
     * This method deletes in the correct order to avoid foreign key constraint violations:
     * 1. Delete all submissions (which will cascade delete submission files)
     * 2. Delete all tasks
     * 3. Delete all phases
     * 4. Delete all template assignments
     * 5. Finally delete the template itself
     */
    @Transactional
    public void deleteTemplate(UUID templateId) {
        // Step 1: Get all phases for this template
        List<ProgressPhase> phases = phaseService.getPhasesByTemplateId(templateId);
        
        for (ProgressPhase phase : phases) {
            // Step 2: Get all tasks for each phase
            List<ProgressTask> tasks = taskService.getTasksByPhaseId(phase.getId());
            
            for (ProgressTask task : tasks) {
                // Step 3: Delete all submissions for each task (this will cascade delete submission files)
                List<ProgressSubmission> submissions = submissionService.getSubmissionsByTaskId(task.getId());
                for (ProgressSubmission submission : submissions) {
                    submissionService.deleteSubmission(submission.getId());
                }
                
                // Step 4: Delete the task
                taskService.deleteTask(task.getId());
            }
            
            // Step 5: Delete the phase
            phaseService.deletePhase(phase.getId());
        }
        
        // Step 6: Delete all template assignments
        assignmentService.deleteAssignmentsByTemplateId(templateId);
        
        // Step 7: Finally delete the template itself
        templateRepo.deleteById(templateId);
    }

    public List<ProgressTemplate> getTemplatesByTenant(UUID tenantId) {
        return templateRepo.findByTenant_Id(tenantId);
    }
}