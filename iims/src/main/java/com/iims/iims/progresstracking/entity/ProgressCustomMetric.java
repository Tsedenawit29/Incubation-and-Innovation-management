package com.iims.iims.progresstracking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class ProgressCustomMetric {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tracking_id")
    private StartupProgressTracking tracking;

    private String metricName;
    private String metricValue;
    private LocalDateTime recordedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public StartupProgressTracking getTracking() { return tracking; }
    public void setTracking(StartupProgressTracking tracking) { this.tracking = tracking; }
    public String getMetricName() { return metricName; }
    public void setMetricName(String metricName) { this.metricName = metricName; }
    public String getMetricValue() { return metricValue; }
    public void setMetricValue(String metricValue) { this.metricValue = metricValue; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
} 