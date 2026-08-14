package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.dto.ContactRequest;

/**
 * Shared subject/body builders so the SMTP and HTTPS mail-API senders produce
 * identical notification content.
 */
final class ContactEmailContent {

    private ContactEmailContent() {
    }

    /** Subject line for the notification email. */
    static String subject(String rawSubject) {
        String subject = rawSubject == null || rawSubject.isBlank() ? "(no subject)" : rawSubject;
        return "[Portfolio] New contact message: " + subject;
    }

    /** Plain-text body for the notification email. */
    static String body(ContactRequest request, String subject) {
        return """
                You received a new message from your portfolio contact form.

                From: %s <%s>
                Subject: %s

                %s

                ---
                Reply directly to this email to answer, or manage it in the admin panel.
                """.formatted(request.name(), request.email(), subject, request.message());
    }
}