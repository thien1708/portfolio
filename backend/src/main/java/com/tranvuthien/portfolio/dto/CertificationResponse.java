package com.tranvuthien.portfolio.dto;

public record CertificationResponse(
        Long id,
        String name,
        String issuer,
        String issued,
        String url,
        int sortOrder
) {
}
