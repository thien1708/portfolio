package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.ContactMessage;
import com.tranvuthien.portfolio.dto.ContactRequest;
import com.tranvuthien.portfolio.repository.ContactMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactMessageRepository repository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private ContactService contactService;

    @BeforeEach
    void setUp() {
        contactService = new ContactService(repository, eventPublisher);
    }

    @Test
    void submit_whenValid_persistsMessageAndPublishesEvent() {
        ContactRequest request = new ContactRequest("John Doe", "john@example.com", "Project Inquiry", "Hello there!", null);

        contactService.submit(request);

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        verify(repository).save(captor.capture());
        ContactMessage saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("John Doe");
        assertThat(saved.getEmail()).isEqualTo("john@example.com");
        assertThat(saved.getSubject()).isEqualTo("Project Inquiry");
        assertThat(saved.getMessage()).isEqualTo("Hello there!");

        ArgumentCaptor<ContactMessageReceived> eventCaptor = ArgumentCaptor.forClass(ContactMessageReceived.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getValue().request()).isEqualTo(request);
    }

    @Test
    void submit_whenHoneypotFilled_silentlyDropsWithoutSavingOrPublishing() {
        ContactRequest spamRequest = new ContactRequest("Bot Spammer", "spammer@bot.com", "Buy crypto", "Spam content", "http://spam-link.com");

        contactService.submit(spamRequest);

        verify(repository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }
}
