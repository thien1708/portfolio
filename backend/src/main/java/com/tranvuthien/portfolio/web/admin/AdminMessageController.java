package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.ContactMessageResponse;
import com.tranvuthien.portfolio.service.ContactService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/messages")
@Tag(name = "Admin – Messages")
@SecurityRequirement(name = "bearerAuth")
public class AdminMessageController {

    private final ContactService contactService;

    public AdminMessageController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public Page<ContactMessageResponse> list(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        return contactService.list(PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100)));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", contactService.unreadCount());
    }

    @PatchMapping("/{id}/read")
    public ContactMessageResponse markRead(@PathVariable Long id,
                                           @RequestParam(defaultValue = "true") boolean read) {
        return contactService.markRead(id, read);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        contactService.delete(id);
    }
}
