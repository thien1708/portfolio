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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String PASSWORD = "Secret@123";

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    private AuthService authService;
    private User user;

    @BeforeEach
    void setUp() {
        AppProperties props = new AppProperties(
                new AppProperties.Jwt("test-only-secret-0123456789abcdef0123456789abcdef", 15, 7),
                new AppProperties.Cors("http://localhost:4200"),
                new AppProperties.Security(false),
                new AppProperties.Storage("local", "uploads",
                        new AppProperties.Storage.Supabase("", "", "portfolio")),
                new AppProperties.Admin("admin@test.local", ""));
        authService = new AuthService(userRepository, refreshTokenRepository, passwordEncoder,
                new JwtService(props), props);

        user = new User();
        user.setId(1L);
        user.setEmail("admin@test.local");
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole("ADMIN");
    }

    @Test
    void loginReturnsAccessTokenAndSetsRefreshCookie() {
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
        MockHttpServletResponse response = new MockHttpServletResponse();

        AuthResponse auth = authService.login(new LoginRequest(user.getEmail(), PASSWORD), response);

        assertThat(auth.accessToken()).isNotBlank();
        assertThat(auth.email()).isEqualTo(user.getEmail());
        assertThat(response.getHeader("Set-Cookie"))
                .contains("refresh_token=")
                .contains("HttpOnly")
                .contains("SameSite=Strict");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void wrongPasswordIncrementsFailedAttempts() {
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(
                new LoginRequest(user.getEmail(), "wrong-password"), new MockHttpServletResponse()))
                .isInstanceOf(BadCredentialsException.class);

        assertThat(user.getFailedAttempts()).isEqualTo(1);
        verify(userRepository).save(user);
    }

    @Test
    void fifthFailedAttemptLocksTheAccount() {
        user.setFailedAttempts(4);
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(
                new LoginRequest(user.getEmail(), "wrong-password"), new MockHttpServletResponse()))
                .isInstanceOf(BadCredentialsException.class);

        assertThat(user.getLockedUntil()).isAfter(LocalDateTime.now());
        assertThat(user.getFailedAttempts()).isZero();
    }

    @Test
    void lockedAccountIsRejectedEvenWithCorrectPassword() {
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(
                new LoginRequest(user.getEmail(), PASSWORD), new MockHttpServletResponse()))
                .isInstanceOf(LockedException.class);
    }

    @Test
    void unknownUserGetsTheSameGenericError() {
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(
                new LoginRequest("nobody@test.local", PASSWORD), new MockHttpServletResponse()))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void refreshRotatesTheToken() {
        RefreshToken stored = new RefreshToken();
        stored.setUser(user);
        stored.setExpiresAt(LocalDateTime.now().plusDays(1));
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(stored));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("refresh_token", "raw-token-value"));
        MockHttpServletResponse response = new MockHttpServletResponse();

        AuthResponse auth = authService.refresh(request, response);

        assertThat(auth.accessToken()).isNotBlank();
        assertThat(stored.isRevoked()).isTrue();
        assertThat(response.getHeader("Set-Cookie")).contains("refresh_token=");
    }

    @Test
    void reusedRefreshTokenRevokesTheWholeFamily() {
        RefreshToken stored = new RefreshToken();
        stored.setUser(user);
        stored.setExpiresAt(LocalDateTime.now().plusDays(1));
        stored.setRevoked(true);
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(stored));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("refresh_token", "raw-token-value"));

        assertThatThrownBy(() -> authService.refresh(request, new MockHttpServletResponse()))
                .isInstanceOf(UnauthorizedException.class);
        verify(refreshTokenRepository).revokeAllForUser(user);
        verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
    }
}
