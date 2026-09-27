package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    long countByCreatedAtAfter(LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT e.ipHash) FROM AnalyticsEvent e WHERE e.createdAt >= :since")
    long countDistinctVisitorsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT e.ipHash) FROM AnalyticsEvent e")
    long countDistinctVisitorsTotal();

    long countByEventTypeAndCreatedAtAfter(String eventType, LocalDateTime since);

    List<AnalyticsEvent> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);

    @Query("SELECT e.eventType, COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt >= :since GROUP BY e.eventType ORDER BY COUNT(e) DESC")
    List<Object[]> countByEventTypeSince(@Param("since") LocalDateTime since);

    @Query("SELECT e.deviceType, COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt >= :since AND e.deviceType IS NOT NULL GROUP BY e.deviceType")
    List<Object[]> countByDeviceTypeSince(@Param("since") LocalDateTime since);

    @Query("SELECT e.referrer, COUNT(e) FROM AnalyticsEvent e WHERE e.createdAt >= :since AND e.referrer IS NOT NULL AND e.referrer != '' GROUP BY e.referrer ORDER BY COUNT(e) DESC")
    List<Object[]> findTopReferrersSince(@Param("since") LocalDateTime since);
}
