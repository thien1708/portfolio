package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.RefreshToken;
import com.tranvuthien.portfolio.domain.User;
import com.tranvuthien.portfolio.dto.LoginRequest;
import com.tranvuthien.portfolio.exception.UnauthorizedException;
import com.tranvuthien.portfolio.repository.RefreshTokenRepository;
import com.tranvuthien.portfolio.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Runs against the real transaction manager (no mocks, no test-level
 * {@code @Transactional}): the failed-attempt counter and the token-family
 * revocation are written right before an exception is thrown, so these tests
 * fail if that write gets rolled back with the transaction.
 */
@SpringBootTest
@ActiveProfiles("test")
class AuthServiceIntegrationTest {

    private static final String PASSWORD = "Secret@123";

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        user = new User();
        user.setEmail("it-" + UUID.randomUUID() + "@test.local");
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole("ADMIN");
        user = userRepository.save(user);
    }

    @Test
    void failedAttemptCounterIsPersistedDespiteTheException() {
        loginExpectingBadCredentials();

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getFailedAttempts()).isEqualTo(1);
    }

    @Test
    void fiveWrongPasswordsLockTheAccountEvenForTheCorrectPassword() {
        for (int i = 0; i < 5; i++) {
            loginExpectingBadCredentials();
        }

        User reloaded = userRepository.findById(user.getId()).orElseThrow();
        assertThat(reloaded.getLockedUntil()).isAfter(LocalDateTime.now());

        assertThatThrownBy(() -> authService.login(
                new LoginRequest(user.getEmail(), PASSWORD), new MockHttpServletResponse()))
                .isInstanceOf(LockedException.class);
    }

    @Test
    void reusedRefreshTokenRevokesTheWholeFamilyInTheDatabase() {
        MockHttpServletResponse loginResponse = new MockHttpServletResponse();
        authService.login(new LoginRequest(user.getEmail(), PASSWORD), loginResponse);
        String firstToken = extractRefreshCookie(loginResponse);

        authService.refresh(requestWithRefreshCookie(firstToken), new MockHttpServletResponse());

        assertThatThrownBy(() -> authService.refresh(
                requestWithRefreshCookie(firstToken), new MockHttpServletResponse()))
                .isInstanceOf(UnauthorizedException.class);

        List<RefreshToken> tokens = refreshTokenRepository.findAll();
        assertThat(tokens).hasSize(2).allMatch(RefreshToken::isRevoked);
    }

    private void loginExpectingBadCredentials() {
        assertThatThrownBy(() -> authService.login(
                new LoginRequest(user.getEmail(), "wrong-password"), new MockHttpServletResponse()))
                .isInstanceOf(BadCredentialsException.class);
    }

    private MockHttpServletRequest requestWithRefreshCookie(String value) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("refresh_token", value));
        return request;
    }

    private String extractRefreshCookie(MockHttpServletResponse response) {
        String header = response.getHeader("Set-Cookie");
        assertThat(header).isNotNull().startsWith("refresh_token=");
        return header.substring("refresh_token=".length(), header.indexOf(';'));
    }
}
