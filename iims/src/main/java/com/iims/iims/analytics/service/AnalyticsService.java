package com.iims.iims.analytics.service;

import com.iims.iims.analytics.dto.AnalyticsResponse;

import java.time.LocalDate;
import java.util.UUID;

public interface AnalyticsService {
    AnalyticsResponse getDashboardAnalytics(UUID tenantId, LocalDate startDate, LocalDate endDate);
    AnalyticsResponse getUserAnalytics(UUID tenantId, LocalDate startDate, LocalDate endDate);
    AnalyticsResponse getStartupAnalytics(UUID tenantId, LocalDate startDate, LocalDate endDate);
    // Add more methods for other analytics modules as needed
}
