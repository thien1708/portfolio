package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.domain.Education;
import com.tranvuthien.portfolio.dto.EducationRequest;
import com.tranvuthien.portfolio.dto.EducationResponse;
import com.tranvuthien.portfolio.repository.EducationRepository;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class EducationService extends AbstractCrudService<Education, EducationRequest, EducationResponse> {

    public EducationService(EducationRepository repository, CacheManager cacheManager) {
        super(repository, cacheManager, CacheConfig.EDUCATION, "Education");
    }

    @Override
    protected Education newEntity() {
        return new Education();
    }

    @Override
    protected void apply(Education education, EducationRequest request) {
        education.setSchool(request.school());
        education.setDegree(request.degree());
        education.setPeriod(request.period());
        education.setDescription(request.description());
    }

    @Override
    protected EducationResponse toResponse(Education e) {
        return new EducationResponse(e.getId(), e.getSchool(), e.getDegree(), e.getPeriod(),
                e.getDescription(), e.getSortOrder());
    }
}
