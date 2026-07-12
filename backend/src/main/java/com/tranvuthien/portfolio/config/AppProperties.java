package com.tranvuthien.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Security security, Storage storage, Admin admin) {

    public record Jwt(String secret, int accessTokenMinutes, int refreshTokenDays) {
    }

    public record Cors(String allowedOrigins) {
    }

    public record Security(boolean cookieSecure) {
    }

    public record Storage(String provider, String uploadDir, Supabase supabase) {

        public record Supabase(String url, String serviceKey, String bucket) {
        }
    }

    public record Admin(String email, String password) {
    }
}
