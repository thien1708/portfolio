package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProjectRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 64) String period,
        @Size(max = 5000) String description,
        List<@Size(max = 80) String> techStack,
        @Size(max = 500) String imageUrl,
        @Size(max = 300) String demoUrl,
        @Size(max = 300) String repoUrl,
        boolean featured
) {
}
