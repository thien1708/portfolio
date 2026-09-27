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

    /** Subject line for the auto-reply confirmation email sent to the visitor. */
    static String autoReplySubject(String rawSubject) {
        return "Thank you for reaching out! | Cảm ơn bạn đã liên hệ — Trần Vũ Thiện";
    }

    /** Plain-text body for the auto-reply confirmation email. */
    static String autoReplyBody(ContactRequest request, String subject) {
        return """
                Hi %s,

                Thank you for getting in touch! I have received your message regarding:
                "%s"

                I will review your inquiry and get back to you as soon as possible (usually within 24–48 hours).

                ---
                Your message:
                %s

                ---
                Best regards,
                Trần Vũ Thiện
                Software Development Engineer
                Hanoi, Vietnam
                Email: tranvuthien1708@gmail.com
                """.formatted(request.name(), subject, request.message());
    }
}