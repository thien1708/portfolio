package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Profile;
import com.tranvuthien.portfolio.dto.ProfileRequest;
import com.tranvuthien.portfolio.dto.ProfileResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.ProfileRepository;
import com.tranvuthien.portfolio.util.Csv;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse get() {
        return repository.findFirstByOrderByIdAsc()
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Profile is not configured yet"));
    }

    @Transactional
    public ProfileResponse update(ProfileRequest request) {
        Profile profile = repository.findFirstByOrderByIdAsc().orElseGet(Profile::new);
        profile.setFullName(request.fullName());
        profile.setTitle(request.title());
        profile.setSummary(request.summary());
        profile.setAvatarUrl(request.avatarUrl());
        profile.setEmail(request.email());
        profile.setPhone(request.phone());
        profile.setLocation(request.location());
        profile.setGithubUrl(request.githubUrl());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setFacebookUrl(request.facebookUrl());
        profile.setCvUrl(request.cvUrl());
        profile.setTypingRoles(Csv.toCsv(request.typingRoles()));
        profile.setYearsExperience(request.yearsExperience());
        return toResponse(repository.save(profile));
    }

    private ProfileResponse toResponse(Profile p) {
        return new ProfileResponse(p.getId(), p.getFullName(), p.getTitle(), p.getSummary(),
                p.getAvatarUrl(), p.getEmail(), p.getPhone(), p.getLocation(), p.getGithubUrl(),
                p.getLinkedinUrl(), p.getFacebookUrl(), p.getCvUrl(),
                Csv.toList(p.getTypingRoles()), p.getYearsExperience());
    }
}
