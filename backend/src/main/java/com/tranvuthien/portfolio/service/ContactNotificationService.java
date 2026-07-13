package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.AppProperties;
import com.tranvuthien.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Emails the site owner when a visitor submits the contact form.
 * Runs async and never throws: the message is already saved in the
 * database, so a mail failure must not fail the API request.
 */
@Service
public class ContactNotificationService {

    private static final Logger log = LoggerFactory.getLogger(ContactNotificationService.class);

    private final JavaMailSender mailSender;
    private final AppProperties properties;

    public ContactNotificationService(JavaMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Async
    public void notifyNewMessage(ContactRequest request) {
        AppProperties.Mail mail = properties.mail();
        if (!mail.enabled()) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mail.from());
            message.setTo(mail.to());
            message.setReplyTo(request.email());
            String subject = request.subject() == null || request.subject().isBlank()
                    ? "(no subject)" : request.subject();
            message.setSubject("[Portfolio] New contact message: " + subject);
            message.setText("""
                    You received a new message from your portfolio contact form.

                    From: %s <%s>
                    Subject: %s

                    %s

                    ---
                    Reply directly to this email to answer, or manage it in the admin panel.
                    """.formatted(request.name(), request.email(), subject, request.message()));
            mailSender.send(message);
            log.info("Contact notification email sent to {}", mail.to());
        } catch (Exception ex) {
            log.warn("Failed to send contact notification email", ex);
        }
    }
}
