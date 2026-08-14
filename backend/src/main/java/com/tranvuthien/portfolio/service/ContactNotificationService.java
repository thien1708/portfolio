package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.AppProperties;
import com.tranvuthien.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Notifies the site owner when a visitor submits the contact form. Listens for
 * {@link ContactMessageReceived} AFTER the submitting transaction commits, so
 * no email goes out for a submission that never reached the database. Runs
 * async with a small retry and never throws: a mail failure must not surface
 * anywhere near the API request. The actual delivery channel is the active
 * {@link ContactMailSender} (Resend HTTPS API or Gmail SMTP).
 */
@Service
public class ContactNotificationService {

    private static final Logger log = LoggerFactory.getLogger(ContactNotificationService.class);
    private static final int MAX_ATTEMPTS = 3;
    private static final long RETRY_BACKOFF_MS = 2_000;

    private final ContactMailSender mailSender;
    private final AppProperties properties;

    public ContactNotificationService(ContactMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Async
    @TransactionalEventListener
    public void notifyNewMessage(ContactMessageReceived event) {
        AppProperties.Mail mail = properties.mail();
        if (!mail.enabled()) {
            return;
        }
        if (!mailSender.isConfigured()) {
            log.info("Contact notification skipped: no mail channel is configured");
            return;
        }
        ContactRequest request = event.request();

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                mailSender.send(request);
                log.info("Contact notification email sent to {}", mail.to());
                return;
            } catch (Exception ex) {
                log.warn("Contact notification email failed (attempt {}/{})", attempt, MAX_ATTEMPTS, ex);
                if (attempt < MAX_ATTEMPTS && !sleepBeforeRetry(attempt)) {
                    return;
                }
            }
        }
        log.warn("Giving up on contact notification email after {} attempts", MAX_ATTEMPTS);
    }

    private boolean sleepBeforeRetry(int attempt) {
        try {
            Thread.sleep(RETRY_BACKOFF_MS * attempt);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}