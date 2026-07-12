package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.AppProperties;
import com.tranvuthien.portfolio.domain.RefreshToken;
import com.tranvuthien.portfolio.domain.User;
import com.tranvuthien.portfolio.dto.AuthResponse;
import com.tranvuthien.portfolio.dto.LoginRequest;
import com.tranvuthien.portfolio.exception.UnauthorizedException;
import com.tranvuthien.portfolio.repository.RefreshTokenRepository;
import com.tranvuthien.portfolio.repository.UserRepository;
import com.tranvuthien.portfolio.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password";
    private static final String REFRESH_COOKIE = "refresh_token";
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AppProperties props;
    private final SecureRandom secureRandom = new SecureRandom();
    /** Valid hash matched when the user does not exist, to equalize response timing. */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService, AppProperties props) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.props = props;
        this.dummyHash = passwordEncoder.encode("dummy-" + UUID.randomUUID());
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElse(null);
        if (user == null) {
            passwordEncoder.matches(request.password(), dummyHash);
            throw new BadCredentialsException(INVALID_CREDENTIALS);
        }
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new LockedException("Account temporarily locked. Try again later.");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            int attempts = user.getFailedAttempts() + 1;
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plus(LOCK_DURATION));
                user.setFailedAttempts(0);
            } else {
                user.setFailedAttempts(attempts);
            }
            userRepository.save(user);
            throw new BadCredentialsException(INVALID_CREDENTIALS);
        }
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        return issueTokens(user, response);
    }

    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String raw = readRefreshCookie(request);
        if (raw == null) {
            throw new UnauthorizedException("Missing refresh token");
        }
        RefreshToken token = refreshTokenRepository.findByTokenHash(sha256(raw))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (token.isRevoked()) {
            // Reuse of a rotated token: assume compromise, revoke the whole family.
            refreshTokenRepository.revokeAllForUser(token.getUser());
            throw new UnauthorizedException("Invalid refresh token");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }
        token.setRevoked(true);
        refreshTokenRepository.save(token);
        return issueTokens(token.getUser(), response);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String raw = readRefreshCookie(request);
        if (raw != null) {
            refreshTokenRepository.findByTokenHash(sha256(raw)).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
        writeRefreshCookie(response, "", Duration.ZERO);
    }

    private AuthResponse issueTokens(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getRole());

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String rawRefresh = HexFormat.of().formatHex(bytes);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(sha256(rawRefresh));
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(props.jwt().refreshTokenDays()));
        refreshTokenRepository.save(refreshToken);

        writeRefreshCookie(response, rawRefresh, Duration.ofDays(props.jwt().refreshTokenDays()));
        return new AuthResponse(accessToken, jwtService.getAccessTokenSeconds(), user.getEmail());
    }

    private void writeRefreshCookie(HttpServletResponse response, String value, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(props.security().cookieSecure())
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String readRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (REFRESH_COOKIE.equals(cookie.getName()) && cookie.getValue() != null
                    && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
