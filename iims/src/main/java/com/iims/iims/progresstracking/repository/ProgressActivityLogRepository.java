package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.ProgressActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProgressActivityLogRepository extends JpaRepository<ProgressActivityLog, UUID> {
} 