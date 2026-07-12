package com.tranvuthien.portfolio.dto;

public record EducationResponse(
        Long id,
        String school,
        String degree,
        String period,
        String description,
        int sortOrder
) {
}
