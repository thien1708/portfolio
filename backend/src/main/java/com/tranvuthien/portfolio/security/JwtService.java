package com.tranvuthien.portfolio.security;

import com.tranvuthien.portfolio.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTokenSeconds;

    public JwtService(AppProperties props) {
        String secret = props.jwt().secret();
        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set and contain at least 32 characters. "
                    + "Generate one with: openssl rand -base64 48");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenSeconds = props.jwt().accessTokenMinutes() * 60L;
    }

    public String generateAccessToken(String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenSeconds)))
                .signWith(key)
                .compact();
    }

    /**
     * Parses and verifies the token signature and expiry.
     * Throws {@link io.jsonwebtoken.JwtException} when invalid.
     */
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getAccessTokenSeconds() {
        return accessTokenSeconds;
    }
}
