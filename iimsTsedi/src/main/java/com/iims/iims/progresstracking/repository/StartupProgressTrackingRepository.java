package com.iims.iims.progresstracking.repository;

import com.iims.iims.progresstracking.entity.StartupProgressTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
 
public interface StartupProgressTrackingRepository extends JpaRepository<StartupProgressTracking, UUID> {
} 