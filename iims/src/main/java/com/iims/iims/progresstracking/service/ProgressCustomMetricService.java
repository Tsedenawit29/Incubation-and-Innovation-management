package com.iims.iims.progresstracking.service;

import com.iims.iims.progresstracking.entity.ProgressCustomMetric;
import com.iims.iims.progresstracking.repository.ProgressCustomMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProgressCustomMetricService {
    @Autowired
    private ProgressCustomMetricRepository metricRepo;

    public ProgressCustomMetric createMetric(ProgressCustomMetric metric) {
        metric.setId(UUID.randomUUID());
        return metricRepo.save(metric);
    }

    public List<ProgressCustomMetric> getAllMetrics() {
        return metricRepo.findAll();
    }

    public Optional<ProgressCustomMetric> getMetricById(UUID id) {
        return metricRepo.findById(id);
    }

    public ProgressCustomMetric updateMetric(ProgressCustomMetric metric) {
        return metricRepo.save(metric);
    }

    public void deleteMetric(UUID id) {
        metricRepo.deleteById(id);
    }
} 