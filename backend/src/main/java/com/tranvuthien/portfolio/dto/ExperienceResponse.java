package com.tranvuthien.portfolio.dto;

import java.util.List;

public record ExperienceResponse(
        Long id,
        String company,
        String role,
        String period,
        String description,
        List<String> techStack,
        int sortOrder
) {
}
