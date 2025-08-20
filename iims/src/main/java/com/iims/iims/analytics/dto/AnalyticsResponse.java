package com.iims.iims.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private String module;
    private TimeRange timeRange;
    private Map<String, Object> metrics;
    private Map<String, Map<String, Object>> breakdowns;
    private Map<LocalDate, Map<String, Object>> trends;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeRange {
        private LocalDate startDate;
        private LocalDate endDate;
        private String period;
    }
    
    // Common metric keys
    public static final String TOTAL_COUNT = "totalCount";
    public static final String ACTIVE_COUNT = "activeCount";
    public static final String GROWTH_RATE = "growthRate";
    public static final String COMPLETION_RATE = "completionRate";
    public static final String ENGAGEMENT_RATE = "engagementRate";
    public static final String AVERAGE_RATING = "averageRating";
}
