package com.iims.iims.progresstracking.controller;

import com.iims.iims.progresstracking.entity.ProgressCustomMetric;
import com.iims.iims.progresstracking.service.ProgressCustomMetricService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/progresstracking/metrics")
public class ProgressCustomMetricController {
    @Autowired
    private ProgressCustomMetricService metricService;

    @PostMapping
    public ResponseEntity<ProgressCustomMetric> create(@RequestBody ProgressCustomMetric metric) {
        return ResponseEntity.ok(metricService.createMetric(metric));
    }

    @GetMapping
    public ResponseEntity<List<ProgressCustomMetric>> getAll() {
        return ResponseEntity.ok(metricService.getAllMetrics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgressCustomMetric> getById(@PathVariable UUID id) {
        Optional<ProgressCustomMetric> metric = metricService.getMetricById(id);
        return metric.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressCustomMetric> update(@PathVariable UUID id, @RequestBody ProgressCustomMetric metric) {
        metric.setId(id);
        return ResponseEntity.ok(metricService.updateMetric(metric));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        metricService.deleteMetric(id);
        return ResponseEntity.noContent().build();
    }
} 