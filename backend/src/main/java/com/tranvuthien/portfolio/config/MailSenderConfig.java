package com.tranvuthien.portfolio.config;

import com.tranvuthien.portfolio.service.ContactMailSender;
import com.tranvuthien.portfolio.service.ResendContactMailSender;
import com.tranvuthien.portfolio.service.SmtpContactMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Selects the active contact-notification channel. When a Resend API key is
 * configured, notifications go through the HTTPS API (port 443 — works even on
 * hosts that block SMTP). Otherwise it falls back to the original Gmail SMTP
 * sender, so the SMTP path can be reused later merely by clearing the API key.
 */
@Configuration
public class MailSenderConfig {

    private static final Logger log = LoggerFactory.getLogger(MailSenderConfig.class);

    @Bean
    @Primary
    ContactMailSender contactMailSender(
            SmtpContactMailSender smtp, ResendContactMailSender resend, AppProperties properties) {
        if (properties.mail().apiEnabled()) {
            log.info("Contact notifications will use the Resend HTTPS API (provider={})",
                    properties.mail().provider());
            return resend;
        }
        log.info("Contact notifications will use SMTP (Gmail) sender (provider={})",
                properties.mail().provider());
        return smtp;
    }
}