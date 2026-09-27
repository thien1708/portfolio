package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.AnalyticsSummaryResponse;
import com.tranvuthien.portfolio.service.AnalyticsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@Tag(name = "Admin – Analytics")
@SecurityRequirement(name = "bearerAuth")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    public AdminAnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary(@RequestParam(defaultValue = "14") int days) {
        return analyticsService.getSummary(days);
    }
}
