package com.tranvuthien.portfolio.dto;

import java.util.List;

public record ProjectResponse(
        Long id,
        String name,
        String period,
        String description,
        List<String> techStack,
        String imageUrl,
        String demoUrl,
        String repoUrl,
        boolean featured,
        int sortOrder
) {
}
