package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.entity.ProgressActivityLog;
import com.iims.iims.progresstracking.service.ProgressActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/progresstracking/activity-logs")
public class ProgressActivityLogController {
    @Autowired
    private ProgressActivityLogService logService;

    @PostMapping
    public ResponseEntity<ProgressActivityLog> create(@RequestBody ProgressActivityLog log) {
        return ResponseEntity.ok(logService.createLog(log));
    }

    @GetMapping
    public ResponseEntity<List<ProgressActivityLog>> getAll() {
        return ResponseEntity.ok(logService.getAllLogs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressActivityLog> getById(@PathVariable UUID id) {
        Optional<ProgressActivityLog> log = logService.getLogById(id);
        return log.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressActivityLog> update(@PathVariable UUID id, @RequestBody ProgressActivityLog log) {
        log.setId(id);
        return ResponseEntity.ok(logService.updateLog(log));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        logService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
} 