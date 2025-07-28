package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressActivityLog;
import com.iims.iims.progresstracking.repository.ProgressActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressActivityLogService {
    @Autowired
    private ProgressActivityLogRepository logRepo;

    public ProgressActivityLog createLog(ProgressActivityLog log) {
        log.setId(UUID.randomUUID());
        return logRepo.save(log);
    }

    public List<ProgressActivityLog> getAllLogs() {
        return logRepo.findAll();
    }

    public Optional<ProgressActivityLog> getLogById(UUID id) {
        return logRepo.findById(id);
    }

    public ProgressActivityLog updateLog(ProgressActivityLog log) {
        return logRepo.save(log);
    }

    public void deleteLog(UUID id) {
        logRepo.deleteById(id);
    }
} 