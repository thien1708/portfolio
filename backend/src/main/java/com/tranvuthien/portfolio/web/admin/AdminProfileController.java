package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.ProfileRequest;
import com.tranvuthien.portfolio.dto.ProfileResponse;
import com.tranvuthien.portfolio.service.ProfileService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/profile")
@Tag(name = "Admin – Profile")
@SecurityRequirement(name = "bearerAuth")
public class AdminProfileController {

    private final ProfileService profileService;

    public AdminProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PutMapping
    public ProfileResponse update(@Valid @RequestBody ProfileRequest request) {
        return profileService.update(request);
    }
}
