package com.iims.iims.analytics.service.impl;

import com.iims.iims.analytics.dto.AnalyticsResponse;
import com.iims.iims.analytics.service.AnalyticsService;
import com.iims.iims.user.entity.Role;
import com.iims.iims.user.entity.User;
import com.iims.iims.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.iims.iims.analytics.dto.AnalyticsResponse.*;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    // Inject other repositories as needed

    @Override
    public AnalyticsResponse getDashboardAnalytics(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        // Default to last 30 days if no date range provided
        if (startDate == null) {
            endDate = LocalDate.now();
            startDate = endDate.minusDays(30);
        }

        // Get user analytics
        AnalyticsResponse userAnalytics = getUserAnalytics(tenantId, startDate, endDate);
        
        // Get startup analytics
        AnalyticsResponse startupAnalytics = getStartupAnalytics(tenantId, startDate, endDate);
        
        // Combine metrics from different modules
        Map<String, Object> combinedMetrics = new HashMap<>();
        combinedMetrics.putAll(userAnalytics.getMetrics());
        combinedMetrics.putAll(startupAnalytics.getMetrics());
        
        // Add any dashboard-specific metrics
        combinedMetrics.put("totalActiveUsers", userAnalytics.getMetrics().get(ACTIVE_COUNT));
        combinedMetrics.put("totalStartups", startupAnalytics.getMetrics().get(TOTAL_COUNT));
        
        return AnalyticsResponse.builder()
                .module("dashboard")
                .timeRange(AnalyticsResponse.TimeRange.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .period(calculatePeriod(startDate, endDate))
                        .build())
                .metrics(combinedMetrics)
                .build();
    }

    @Override
    public AnalyticsResponse getUserAnalytics(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        // Default to last 30 days if no date range provided
        if (startDate == null) {
            endDate = LocalDate.now();
            startDate = endDate.minusDays(30);
        }

        // Get all users for the tenant
        List<User> users = userRepository.findByTenantId(tenantId);
        
        // Calculate metrics
        long totalUsers = users.size();
        long activeUsers = users.stream()
                .filter(User::isActive)
                .count();
        
        // Calculate users by role
        Map<String, Long> usersByRole = users.stream()
                .collect(Collectors.groupingBy(
                        user -> user.getRole().name(),
                        Collectors.counting()
                ));
        
        // Calculate growth rate (simplified example)
        LocalDate previousPeriodStart = startDate.minus(ChronoUnit.DAYS.between(startDate, endDate), ChronoUnit.DAYS);
        long previousPeriodCount = userRepository.countByTenantIdAndCreatedAtBetween(
                tenantId, 
                previousPeriodStart.atStartOfDay(), 
                startDate.minusDays(1).atTime(23, 59, 59)
        );
        
        double growthRate = previousPeriodCount > 0 ? 
                ((totalUsers - previousPeriodCount) / (double) previousPeriodCount) * 100 : 0;

        // Build response
        return AnalyticsResponse.builder()
                .module("users")
                .timeRange(AnalyticsResponse.TimeRange.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .period(calculatePeriod(startDate, endDate))
                        .build())
                .metrics(Map.of(
                        TOTAL_COUNT, totalUsers,
                        ACTIVE_COUNT, activeUsers,
                        GROWTH_RATE, Math.round(growthRate * 100) / 100.0,
                        ENGAGEMENT_RATE, calculateEngagementRate(users) // Implement this based on your logic
                ))
                .breakdowns(Map.of(
                        "byRole", usersByRole.entrySet().stream()
                                .collect(Collectors.toMap(
                                        Map.Entry::getKey,
                                        e -> (Object) e.getValue()
                                ))
                ))
                .build();
    }

    @Override
    public AnalyticsResponse getStartupAnalytics(UUID tenantId, LocalDate startDate, LocalDate endDate) {
        // Default to last 30 days if no date range provided
        if (startDate == null) {
            endDate = LocalDate.now();
            startDate = endDate.minusDays(30);
        }

        // Get all startups for the tenant
        List<User> startups = userRepository.findByTenantIdAndRole(tenantId, Role.STARTUP);
        
        // Calculate metrics
        long totalStartups = startups.size();
        long activeStartups = startups.stream()
                .filter(User::isActive)
                .count();
        
        // Calculate growth rate (simplified example)
        LocalDate previousPeriodStart = startDate.minus(ChronoUnit.DAYS.between(startDate, endDate), ChronoUnit.DAYS);
        long previousPeriodCount = userRepository.countByTenantIdAndRoleAndCreatedAtBetween(
                tenantId, 
                Role.STARTUP,
                previousPeriodStart.atStartOfDay(), 
                startDate.minusDays(1).atTime(23, 59, 59)
        );
        
        double growthRate = previousPeriodCount > 0 ? 
                ((totalStartups - previousPeriodCount) / (double) previousPeriodCount) * 100 : 0;

        // Build response
        return AnalyticsResponse.builder()
                .module("startups")
                .timeRange(AnalyticsResponse.TimeRange.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .period(calculatePeriod(startDate, endDate))
                        .build())
                .metrics(Map.of(
                        TOTAL_COUNT, totalStartups,
                        ACTIVE_COUNT, activeStartups,
                        GROWTH_RATE, Math.round(growthRate * 100) / 100.0
                        // Add more startup-specific metrics
                ))
                .build();
    }
    
    private String calculatePeriod(LocalDate startDate, LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days <= 7) return "week";
        if (days <= 30) return "month";
        if (days <= 90) return "quarter";
        if (days <= 365) return "year";
        return "all";
    }
    
    private double calculateEngagementRate(List<User> users) {
        // Implement engagement rate calculation based on your business logic
        // This is a simplified example
        long activeUsers = users.stream()
                .filter(User::isActive)
                .count();
        return users.isEmpty() ? 0 : (activeUsers / (double) users.size()) * 100;
    }
}
