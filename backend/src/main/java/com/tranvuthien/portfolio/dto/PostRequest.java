package com.tranvuthien.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PostRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255)
        String title,

        @Size(max = 255)
        String slug,

        String summary,

        @NotBlank(message = "Content is required")
        String content,

        String coverImageUrl,

        List<String> tags,

        boolean published,

        Integer readingTimeMinutes
) {
}
