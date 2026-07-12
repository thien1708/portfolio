package com.tranvuthien.portfolio.dto;

public record SkillResponse(
        Long id,
        String name,
        String category,
        int proficiency,
        String icon,
        int sortOrder
) {
}
