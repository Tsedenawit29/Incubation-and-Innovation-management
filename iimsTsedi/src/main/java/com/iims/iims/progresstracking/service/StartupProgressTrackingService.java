package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.StartupProgressTracking;
import com.iims.iims.progresstracking.repository.StartupProgressTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StartupProgressTrackingService {
    @Autowired
    private StartupProgressTrackingRepository trackingRepo;

    public StartupProgressTracking createTracking(StartupProgressTracking tracking) {
        tracking.setId(UUID.randomUUID());
        return trackingRepo.save(tracking);
    }

    public List<StartupProgressTracking> getAllTrackings() {
        return trackingRepo.findAll();
    }

    public Optional<StartupProgressTracking> getTrackingById(UUID id) {
        return trackingRepo.findById(id);
    }

    public StartupProgressTracking updateTracking(StartupProgressTracking tracking) {
        return trackingRepo.save(tracking);
    }

    public void deleteTracking(UUID id) {
        trackingRepo.deleteById(id);
    }
} 