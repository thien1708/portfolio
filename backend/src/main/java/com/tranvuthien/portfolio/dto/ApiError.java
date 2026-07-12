package com.tranvuthien.portfolio.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ApiError(
        LocalDateTime timestamp,
        int status,
        String message,
        List<String> errors
) {
    public static ApiError of(int status, String message) {
        return new ApiError(LocalDateTime.now(), status, message, List.of());
    }

    public static ApiError of(int status, String message, List<String> errors) {
        return new ApiError(LocalDateTime.now(), status, message, errors);
    }
}
