package com.tranvuthien.portfolio.dto;

public record AuthResponse(String accessToken, long expiresInSeconds, String email) {
}
