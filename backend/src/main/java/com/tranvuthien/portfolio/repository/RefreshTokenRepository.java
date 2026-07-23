package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.RefreshToken;
import com.tranvuthien.portfolio.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update RefreshToken t set t.revoked = true where t.user = :user and t.revoked = false")
    void revokeAllForUser(@Param("user") User user);

    /**
     * Expired tokens can never refresh again, revoked or not — safe to purge.
     * Revoked-but-unexpired rows must stay so reuse detection keeps working.
     */
    @Modifying
    @Query("delete from RefreshToken t where t.expiresAt < :now")
    int deleteAllExpiredBefore(@Param("now") LocalDateTime now);
}
