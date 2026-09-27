package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.AnalyticsEvent;
import com.tranvuthien.portfolio.dto.AnalyticsSummaryResponse;
import com.tranvuthien.portfolio.dto.AnalyticsTrackRequest;
import com.tranvuthien.portfolio.repository.AnalyticsEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);
    private final AnalyticsEventRepository repository;

    public AnalyticsService(AnalyticsEventRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void track(AnalyticsTrackRequest request, HttpServletRequest httpRequest) {
        String path = request.path() != null ? request.path().trim() : "";
        if (path.startsWith("/admin")) {
            // Do not record administrative sessions to preserve analytics purity
            return;
        }

        String rawIp = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";
        String ipHash = hashIp(rawIp);

        String userAgent = httpRequest != null ? httpRequest.getHeader("User-Agent") : null;
        if (userAgent != null && userAgent.length() > 500) {
            userAgent = userAgent.substring(0, 500);
        }
        String deviceType = detectDevice(userAgent);

        String referrer = request.referrer();
        if (referrer != null && referrer.length() > 500) {
            referrer = referrer.substring(0, 500);
        }

        AnalyticsEvent event = new AnalyticsEvent();
        event.setEventType(request.eventType().toUpperCase(Locale.ROOT));
        event.setPath(path.length() > 255 ? path.substring(0, 255) : path);
        event.setReferrer(referrer);
        event.setIpHash(ipHash);
        event.setUserAgent(userAgent);
        event.setDeviceType(deviceType);
        event.setMetadata(request.metadata());
        event.setCreatedAt(LocalDateTime.now());

        repository.save(event);
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(int days) {
        if (days <= 0 || days > 90) {
            days = 14;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime periodAgo = now.minusDays(days);

        long totalViews = repository.count();
        long uniqueVisitors = repository.countDistinctVisitorsTotal();
        long viewsToday = repository.countByCreatedAtAfter(startOfToday);
        long viewsLast7Days = repository.countByCreatedAtAfter(sevenDaysAgo);
        long viewsLast30Days = repository.countByCreatedAtAfter(thirtyDaysAgo);

        long cvViews = repository.countByEventTypeAndCreatedAtAfter("CV_VIEW", periodAgo);
        long cvDownloads = repository.countByEventTypeAndCreatedAtAfter("CV_DOWNLOAD", periodAgo);
        long projectClicks = repository.countByEventTypeAndCreatedAtAfter("PROJECT_CLICK", periodAgo);

        // Daily series for trend chart
        List<AnalyticsEvent> recentEvents = repository.findByCreatedAtAfterOrderByCreatedAtDesc(periodAgo);
        Map<String, Long> dateCounts = new LinkedHashMap<>();
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE;

        for (int i = days - 1; i >= 0; i--) {
            String dateStr = LocalDate.now().minusDays(i).format(dtf);
            dateCounts.put(dateStr, 0L);
        }

        for (AnalyticsEvent event : recentEvents) {
            String eventDate = event.getCreatedAt().toLocalDate().format(dtf);
            if (dateCounts.containsKey(eventDate)) {
                dateCounts.put(eventDate, dateCounts.get(eventDate) + 1);
            }
        }

        List<AnalyticsSummaryResponse.DailyStat> dailyViews = new ArrayList<>();
        dateCounts.forEach((date, count) -> dailyViews.add(new AnalyticsSummaryResponse.DailyStat(date, count)));

        // Device breakdown
        Map<String, Long> deviceBreakdown = new LinkedHashMap<>();
        for (Object[] row : repository.countByDeviceTypeSince(periodAgo)) {
            String device = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            deviceBreakdown.put(device, count);
        }

        // Top referrers
        List<AnalyticsSummaryResponse.ReferrerStat> topReferrers = new ArrayList<>();
        for (Object[] row : repository.findTopReferrersSince(periodAgo)) {
            String ref = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            topReferrers.add(new AnalyticsSummaryResponse.ReferrerStat(ref, count));
        }

        // Top events
        Map<String, Long> topEvents = new LinkedHashMap<>();
        for (Object[] row : repository.countByEventTypeSince(periodAgo)) {
            String ev = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            topEvents.put(ev, count);
        }

        return new AnalyticsSummaryResponse(
                totalViews,
                uniqueVisitors,
                viewsToday,
                viewsLast7Days,
                viewsLast30Days,
                cvViews,
                cvDownloads,
                projectClicks,
                dailyViews,
                deviceBreakdown,
                topReferrers,
                topEvents
        );
    }

    private String detectDevice(String ua) {
        if (ua == null || ua.isBlank()) {
            return "DESKTOP";
        }
        String lower = ua.toLowerCase(Locale.ROOT);
        if (lower.contains("ipad") || lower.contains("tablet")) {
            return "TABLET";
        }
        if (lower.contains("mobile") || lower.contains("android") || lower.contains("iphone") || lower.contains("ipod")) {
            return "MOBILE";
        }
        return "DESKTOP";
    }

    private String hashIp(String rawIp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawIp.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 not supported", e);
            return Integer.toHexString(rawIp.hashCode());
        }
    }
}
