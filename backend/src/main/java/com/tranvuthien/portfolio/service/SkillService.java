package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.domain.Skill;
import com.tranvuthien.portfolio.dto.SkillRequest;
import com.tranvuthien.portfolio.dto.SkillResponse;
import com.tranvuthien.portfolio.repository.SkillRepository;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class SkillService extends AbstractCrudService<Skill, SkillRequest, SkillResponse> {

    public SkillService(SkillRepository repository, CacheManager cacheManager) {
        super(repository, cacheManager, CacheConfig.SKILLS, "Skill");
    }

    @Override
    protected Skill newEntity() {
        return new Skill();
    }

    @Override
    protected void apply(Skill skill, SkillRequest request) {
        skill.setName(request.name());
        skill.setCategory(request.category());
        skill.setProficiency(request.proficiency());
        skill.setIcon(request.icon());
    }

    @Override
    protected SkillResponse toResponse(Skill s) {
        return new SkillResponse(s.getId(), s.getName(), s.getCategory(), s.getProficiency(),
                s.getIcon(), s.getSortOrder());
    }
}
