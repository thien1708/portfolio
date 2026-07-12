package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.EducationRequest;
import com.tranvuthien.portfolio.dto.EducationResponse;
import com.tranvuthien.portfolio.dto.ReorderRequest;
import com.tranvuthien.portfolio.service.EducationService;
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
@RequestMapping("/api/v1/admin/education")
@Tag(name = "Admin – Education")
@SecurityRequirement(name = "bearerAuth")
public class AdminEducationController {

    private final EducationService educationService;

    public AdminEducationController(EducationService educationService) {
        this.educationService = educationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EducationResponse create(@Valid @RequestBody EducationRequest request) {
        return educationService.create(request);
    }

    @PutMapping("/{id}")
    public EducationResponse update(@PathVariable Long id,
                                    @Valid @RequestBody EducationRequest request) {
        return educationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        educationService.delete(id);
    }

    @PutMapping("/reorder")
    public void reorder(@Valid @RequestBody ReorderRequest request) {
        educationService.reorder(request.ids());
    }
}
