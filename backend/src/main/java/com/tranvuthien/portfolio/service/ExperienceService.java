package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.domain.Experience;
import com.tranvuthien.portfolio.dto.ExperienceRequest;
import com.tranvuthien.portfolio.dto.ExperienceResponse;
import com.tranvuthien.portfolio.repository.ExperienceRepository;
import com.tranvuthien.portfolio.util.Csv;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class ExperienceService extends AbstractCrudService<Experience, ExperienceRequest, ExperienceResponse> {

    public ExperienceService(ExperienceRepository repository, CacheManager cacheManager) {
        super(repository, cacheManager, CacheConfig.EXPERIENCES, "Experience");
    }

    @Override
    protected Experience newEntity() {
        return new Experience();
    }

    @Override
    protected void apply(Experience experience, ExperienceRequest request) {
        experience.setCompany(request.company());
        experience.setRole(request.role());
        experience.setPeriod(request.period());
        experience.setDescription(request.description());
        experience.setTechStack(Csv.toCsv(request.techStack()));
    }

    @Override
    protected ExperienceResponse toResponse(Experience e) {
        return new ExperienceResponse(e.getId(), e.getCompany(), e.getRole(), e.getPeriod(),
                e.getDescription(), Csv.toList(e.getTechStack()), e.getSortOrder());
    }
}
