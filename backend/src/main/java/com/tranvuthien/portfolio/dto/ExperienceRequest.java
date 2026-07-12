package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ExperienceRequest(
        @NotBlank @Size(max = 160) String company,
        @NotBlank @Size(max = 160) String role,
        @Size(max = 64) String period,
        @Size(max = 5000) String description,
        List<@Size(max = 80) String> techStack
) {
}
