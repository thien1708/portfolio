package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.CertificationRequest;
import com.tranvuthien.portfolio.dto.CertificationResponse;
import com.tranvuthien.portfolio.dto.ReorderRequest;
import com.tranvuthien.portfolio.service.CertificationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/certifications")
@Tag(name = "Admin – Certifications")
@SecurityRequirement(name = "bearerAuth")
public class AdminCertificationController {

    private final CertificationService certificationService;

    public AdminCertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CertificationResponse create(@Valid @RequestBody CertificationRequest request) {
        return certificationService.create(request);
    }

    @PutMapping("/{id}")
    public CertificationResponse update(@PathVariable Long id,
                                        @Valid @RequestBody CertificationRequest request) {
        return certificationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        certificationService.delete(id);
    }

    @PutMapping("/reorder")
    public void reorder(@Valid @RequestBody ReorderRequest request) {
        certificationService.reorder(request.ids());
    }
}
