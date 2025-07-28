package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressTask;
import com.iims.iims.progresstracking.repository.ProgressTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressTaskService {
    @Autowired
    private ProgressTaskRepository taskRepo;

    public ProgressTask createTask(ProgressTask task) {
        task.setId(UUID.randomUUID());
        return taskRepo.save(task);
    }

    public List<ProgressTask> getAllTasks() {
        return taskRepo.findAll();
    }

    public Optional<ProgressTask> getTaskById(UUID id) {
        return taskRepo.findById(id);
    }

    public ProgressTask updateTask(ProgressTask task) {
        return taskRepo.save(task);
    }

    public void deleteTask(UUID id) {
        taskRepo.deleteById(id);
    }

    public List<ProgressTask> getTasksByPhaseId(UUID phaseId) {
        return taskRepo.findByPhaseId(phaseId);
    }
} 