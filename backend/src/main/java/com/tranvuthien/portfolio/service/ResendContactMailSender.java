package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.AppProperties;
import com.tranvuthien.portfolio.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Delivers contact notifications through the Resend HTTPS API
 * ({@code https://api.resend.com/emails}) instead of SMTP. HTTPS uses port 443,
 * which hosting providers that block outbound SMTP (e.g. Render's free tier)
 * still allow. The Gmail SMTP path stays in {@link SmtpContactMailSender}.
 */
@Component
public class ResendContactMailSender implements ContactMailSender {

    private static final Logger log = LoggerFactory.getLogger(ResendContactMailSender.class);
    private static final String RESEND_ENDPOINT = "https://api.resend.com/emails";

    private final AppProperties properties;
    private final RestClient restClient;

    public ResendContactMailSender(AppProperties properties, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public boolean isConfigured() {
        return properties.mail().apiEnabled();
    }

    @Override
    public void send(ContactRequest request) {
        AppProperties.Mail mail = properties.mail();
        String subject = request.subject() == null || request.subject().isBlank()
                ? "(no subject)" : request.subject();
        String from = mail.from() == null || mail.from().isBlank()
                ? "Portfolio <onboarding@resend.dev>" : mail.from();
        String to = mail.to() == null || mail.to().isBlank()
                ? "tranvuthien1708@gmail.com" : mail.to();

        Map<String, Object> payload = Map.of(
                "from", from,
                "to", new String[]{to},
                "reply_to", request.email(),
                "subject", ContactEmailContent.subject(subject),
                "text", ContactEmailContent.body(request, subject)
        );

        restClient.post()
                .uri(RESEND_ENDPOINT)
                .header("Authorization", "Bearer " + mail.apiKey())
                .header("Content-Type", "application/json")
                .body(payload)
                .retrieve()
                .toBodilessEntity();

        log.info("Contact notification email sent via Resend to {}", to);
    }
}