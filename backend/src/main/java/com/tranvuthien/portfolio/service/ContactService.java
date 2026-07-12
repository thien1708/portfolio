package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.ContactMessage;
import com.tranvuthien.portfolio.dto.ContactMessageResponse;
import com.tranvuthien.portfolio.dto.ContactRequest;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.ContactMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private final ContactMessageRepository repository;

    public ContactService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void submit(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.name());
        message.setEmail(request.email());
        message.setSubject(request.subject());
        message.setMessage(request.message());
        repository.save(message);
    }

    @Transactional(readOnly = true)
    public Page<ContactMessageResponse> list(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return repository.countByReadFalse();
    }

    @Transactional
    public ContactMessageResponse markRead(Long id, boolean read) {
        ContactMessage message = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Message", id));
        message.setRead(read);
        return toResponse(repository.save(message));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Message", id);
        }
        repository.deleteById(id);
    }

    private ContactMessageResponse toResponse(ContactMessage m) {
        return new ContactMessageResponse(m.getId(), m.getName(), m.getEmail(), m.getSubject(),
                m.getMessage(), m.getCreatedAt(), m.isRead());
    }
}
