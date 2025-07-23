package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressPhase;
import com.iims.iims.progresstracking.repository.ProgressPhaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressPhaseService {
    @Autowired
    private ProgressPhaseRepository phaseRepo;

    public ProgressPhase createPhase(ProgressPhase phase) {
        phase.setId(UUID.randomUUID());
        return phaseRepo.save(phase);
    }

    public List<ProgressPhase> getAllPhases() {
        return phaseRepo.findAll();
    }

    public Optional<ProgressPhase> getPhaseById(UUID id) {
        return phaseRepo.findById(id);
    }

    public ProgressPhase updatePhase(ProgressPhase phase) {
        return phaseRepo.save(phase);
    }

    public void deletePhase(UUID id) {
        phaseRepo.deleteById(id);
    }

    public List<ProgressPhase> getPhasesByTemplateId(UUID templateId) {
        return phaseRepo.findByTemplate_Id(templateId);
    }
} 