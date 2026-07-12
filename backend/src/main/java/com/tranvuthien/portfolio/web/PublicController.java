package com.tranvuthien.portfolio.web;

import com.tranvuthien.portfolio.dto.CertificationResponse;
import com.tranvuthien.portfolio.dto.ContactRequest;
import com.tranvuthien.portfolio.dto.EducationResponse;
import com.tranvuthien.portfolio.dto.ExperienceResponse;
import com.tranvuthien.portfolio.dto.ProfileResponse;
import com.tranvuthien.portfolio.dto.ProjectResponse;
import com.tranvuthien.portfolio.dto.SkillResponse;
import com.tranvuthien.portfolio.service.CertificationService;
import com.tranvuthien.portfolio.service.ContactService;
import com.tranvuthien.portfolio.service.EducationService;
import com.tranvuthien.portfolio.service.ExperienceService;
import com.tranvuthien.portfolio.service.ProfileService;
import com.tranvuthien.portfolio.service.ProjectService;
import com.tranvuthien.portfolio.service.SkillService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Public", description = "Public portfolio content")
public class PublicController {

    private final ProfileService profileService;
    private final SkillService skillService;
    private final ExperienceService experienceService;
    private final ProjectService projectService;
    private final EducationService educationService;
    private final CertificationService certificationService;
    private final ContactService contactService;

    public PublicController(ProfileService profileService, SkillService skillService,
                            ExperienceService experienceService, ProjectService projectService,
                            EducationService educationService, CertificationService certificationService,
                            ContactService contactService) {
        this.profileService = profileService;
        this.skillService = skillService;
        this.experienceService = experienceService;
        this.projectService = projectService;
        this.educationService = educationService;
        this.certificationService = certificationService;
        this.contactService = contactService;
    }

    /** Lightweight liveness probe for hosting health checks (e.g. Render). */
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/profile")
    public ProfileResponse profile() {
        return profileService.get();
    }

    @GetMapping("/skills")
    public List<SkillResponse> skills() {
        return skillService.list();
    }

    @GetMapping("/experiences")
    public List<ExperienceResponse> experiences() {
        return experienceService.list();
    }

    @GetMapping("/projects")
    public List<ProjectResponse> projects() {
        return projectService.list();
    }

    @GetMapping("/education")
    public List<EducationResponse> education() {
        return educationService.list();
    }

    @GetMapping("/certifications")
    public List<CertificationResponse> certifications() {
        return certificationService.list();
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public void contact(@Valid @RequestBody ContactRequest request) {
        contactService.submit(request);
    }
}
