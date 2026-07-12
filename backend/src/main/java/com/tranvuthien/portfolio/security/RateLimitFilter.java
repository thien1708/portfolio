package com.tranvuthien.portfolio.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tranvuthien.portfolio.dto.ApiError;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory, per-client-IP rate limiting. Strict buckets protect the login
 * endpoint (brute force) and the public contact endpoint (spam); a generous
 * general bucket covers the rest of the API.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private record Limit(String name, int capacity, Duration period) {
    }

    private static final Limit LOGIN = new Limit("login", 5, Duration.ofMinutes(1));
    private static final Limit CONTACT = new Limit("contact", 3, Duration.ofMinutes(1));
    private static final Limit GENERAL = new Limit("general", 120, Duration.ofMinutes(1));
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Limit limit = resolveLimit(request);
        if (limit == null) {
            filterChain.doFilter(request, response);
            return;
        }
        if (buckets.size() > MAX_TRACKED_CLIENTS) {
            buckets.clear();
        }
        String key = limit.name() + "|" + clientIp(request);
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(limit));
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getWriter(),
                    ApiError.of(429, "Too many requests. Please try again later."));
        }
    }

    private Limit resolveLimit(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean post = "POST".equalsIgnoreCase(request.getMethod());
        if (post && path.equals("/api/v1/auth/login")) {
            return LOGIN;
        }
        if (post && path.equals("/api/v1/contact")) {
            return CONTACT;
        }
        if (path.startsWith("/api/")) {
            return GENERAL;
        }
        return null;
    }

    private Bucket newBucket(Limit limit) {
        Bandwidth bandwidth = Bandwidth.builder()
                .capacity(limit.capacity())
                .refillGreedy(limit.capacity(), limit.period())
                .build();
        return Bucket.builder().addLimit(bandwidth).build();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
