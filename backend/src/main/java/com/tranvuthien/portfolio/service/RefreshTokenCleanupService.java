package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Every login and refresh inserts a refresh-token row; rotation only marks the
 * old row revoked. Without this job the table grows forever.
 */
@Service
public class RefreshTokenCleanupService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupService.class);

    private final RefreshTokenRepository repository;

    public RefreshTokenCleanupService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        int removed = repository.deleteAllExpiredBefore(LocalDateTime.now());
        if (removed > 0) {
            log.info("Removed {} expired refresh tokens", removed);
        }
    }
}
