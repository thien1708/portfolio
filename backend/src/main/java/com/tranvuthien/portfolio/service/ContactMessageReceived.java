package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.dto.ContactRequest;

/** Published after a contact-form submission is committed to the database. */
public record ContactMessageReceived(ContactRequest request) {
}
