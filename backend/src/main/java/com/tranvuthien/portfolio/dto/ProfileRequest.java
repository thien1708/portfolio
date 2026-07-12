package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProfileRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(max = 160) String title,
        @Size(max = 5000) String summary,
        @Size(max = 500) String avatarUrl,
        @NotBlank @Email @Size(max = 160) String email,
        @Size(max = 60) String phone,
        @Size(max = 120) String location,
        @Size(max = 300) String githubUrl,
        @Size(max = 300) String linkedinUrl,
        @Size(max = 300) String facebookUrl,
        @Size(max = 500) String cvUrl,
        List<@Size(max = 120) String> typingRoles,
        @Min(0) @Max(60) Integer yearsExperience
) {
}
