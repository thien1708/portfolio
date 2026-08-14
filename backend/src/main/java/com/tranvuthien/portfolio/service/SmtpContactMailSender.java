package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.AppProperties;
import com.tranvuthien.portfolio.dto.ContactRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Delivers contact notifications via a classic SMTP server (e.g. Gmail).
 * Kept intact so it can be reused once the hosting plan allows outbound SMTP.
 */
@Component
public class SmtpContactMailSender implements ContactMailSender {

    private final JavaMailSender mailSender;
    private final AppProperties properties;

    public SmtpContactMailSender(JavaMailSender mailSender, AppProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    @Override
    public boolean isConfigured() {
        return properties.mail().enabled();
    }

    @Override
    public void send(ContactRequest request) {
        AppProperties.Mail mail = properties.mail();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mail.from());
        message.setTo(mail.to());
        message.setReplyTo(request.email());
        String subject = request.subject() == null || request.subject().isBlank()
                ? "(no subject)" : request.subject();
        message.setSubject(ContactEmailContent.subject(subject));
        message.setText(ContactEmailContent.body(request, subject));

        mailSender.send(message);
    }
}