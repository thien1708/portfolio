package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EducationRequest(
        @NotBlank @Size(max = 200) String school,
        @Size(max = 200) String degree,
        @Size(max = 64) String period,
        @Size(max = 5000) String description
) {
}
