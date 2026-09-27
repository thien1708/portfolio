package com.tranvuthien.portfolio.web;

import com.tranvuthien.portfolio.dto.AnalyticsTrackRequest;
import com.tranvuthien.portfolio.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics", description = "Privacy-friendly client telemetry tracking")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/track")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Map<String, Boolean> track(@Valid @RequestBody AnalyticsTrackRequest request, HttpServletRequest httpRequest) {
        analyticsService.track(request, httpRequest);
        return Map.of("ok", true);
    }
}
