package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CertificationRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 160) String issuer,
        @Size(max = 64) String issued,
        @Size(max = 300) String url
) {
}
