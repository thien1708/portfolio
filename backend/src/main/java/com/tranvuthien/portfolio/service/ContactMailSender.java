package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.dto.ContactRequest;

/**
 * Abstraction over the channel used to deliver contact-form notifications to
 * the site owner. Implementations may use SMTP or an HTTPS mail API.
 */
public interface ContactMailSender {

    /** Whether this sender has everything it needs to send a real email. */
    boolean isConfigured();

    /**
     * Send a notification email for a new contact message.
     *
     * @param request the submitted contact form payload
     * @throws RuntimeException if the send fails; the caller decides how to handle it
     */
    void send(ContactRequest request);
}