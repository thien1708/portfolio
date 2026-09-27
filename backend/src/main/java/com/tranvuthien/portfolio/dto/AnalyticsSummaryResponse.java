package com.tranvuthien.portfolio.dto;

import java.util.List;
import java.util.Map;

public record AnalyticsSummaryResponse(
        long totalViews,
        long uniqueVisitors,
        long viewsToday,
        long viewsLast7Days,
        long viewsLast30Days,
        long cvViews,
        long cvDownloads,
        long projectClicks,
        List<DailyStat> dailyViews,
        Map<String, Long> deviceBreakdown,
        List<ReferrerStat> topReferrers,
        Map<String, Long> topEvents
) {
    public record DailyStat(String date, long count) {}
    public record ReferrerStat(String referrer, long count) {}
}
