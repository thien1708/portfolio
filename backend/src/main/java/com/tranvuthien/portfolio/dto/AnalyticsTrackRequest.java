package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AnalyticsTrackRequest(
        @NotBlank @Size(max = 50) String eventType,
        @Size(max = 255) String path,
        @Size(max = 500) String referrer,
        @Size(max = 1000) String metadata
) {
}
