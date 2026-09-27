package com.tranvuthien.portfolio.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String coverImageUrl,
        List<String> tags,
        boolean published,
        int viewsCount,
        int readingTimeMinutes,
        int sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
