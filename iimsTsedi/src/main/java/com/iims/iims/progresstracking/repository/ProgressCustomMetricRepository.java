package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressCustomMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
 
public interface ProgressCustomMetricRepository extends JpaRepository<ProgressCustomMetric, UUID> {
} 