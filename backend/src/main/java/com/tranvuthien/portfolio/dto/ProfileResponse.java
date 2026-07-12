package com.tranvuthien.portfolio.dto;

import java.util.List;

public record ProfileResponse(
        Long id,
        String fullName,
        String title,
        String summary,
        String avatarUrl,
        String email,
        String phone,
        String location,
        String githubUrl,
        String linkedinUrl,
        String facebookUrl,
        String cvUrl,
        List<String> typingRoles,
        Integer yearsExperience
) {
}
