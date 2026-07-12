package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.ExperienceRequest;
import com.tranvuthien.portfolio.dto.ExperienceResponse;
import com.tranvuthien.portfolio.dto.ReorderRequest;
import com.tranvuthien.portfolio.service.ExperienceService;
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
@RequestMapping("/api/v1/admin/experiences")
@Tag(name = "Admin – Experiences")
@SecurityRequirement(name = "bearerAuth")
public class AdminExperienceController {

    private final ExperienceService experienceService;

    public AdminExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExperienceResponse create(@Valid @RequestBody ExperienceRequest request) {
        return experienceService.create(request);
    }

    @PutMapping("/{id}")
    public ExperienceResponse update(@PathVariable Long id,
                                     @Valid @RequestBody ExperienceRequest request) {
        return experienceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        experienceService.delete(id);
    }

    @PutMapping("/reorder")
    public void reorder(@Valid @RequestBody ReorderRequest request) {
        experienceService.reorder(request.ids());
    }
}
