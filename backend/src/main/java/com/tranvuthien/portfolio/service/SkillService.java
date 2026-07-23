package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Skill;
import com.tranvuthien.portfolio.dto.SkillRequest;
import com.tranvuthien.portfolio.dto.SkillResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.repository.SkillRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository repository;

    public SkillService(SkillRepository repository) {
        this.repository = repository;
    }

    @Cacheable(CacheConfig.SKILLS)
    @Transactional(readOnly = true)
    public List<SkillResponse> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream().map(this::toResponse).toList();
    }

    @CacheEvict(cacheNames = CacheConfig.SKILLS, allEntries = true)
    @Transactional
    public SkillResponse create(SkillRequest request) {
        Skill skill = new Skill();
        apply(skill, request);
        skill.setSortOrder((int) repository.count());
        return toResponse(repository.save(skill));
    }

    @CacheEvict(cacheNames = CacheConfig.SKILLS, allEntries = true)
    @Transactional
    public SkillResponse update(Long id, SkillRequest request) {
        Skill skill = repository.findById(id).orElseThrow(() -> NotFoundException.of("Skill", id));
        apply(skill, request);
        return toResponse(repository.save(skill));
    }

    @CacheEvict(cacheNames = CacheConfig.SKILLS, allEntries = true)
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Skill", id);
        }
        repository.deleteById(id);
    }

    @CacheEvict(cacheNames = CacheConfig.SKILLS, allEntries = true)
    @Transactional
    public void reorder(List<Long> ids) {
        Map<Long, Skill> byId = repository.findAllById(ids).stream()
                .collect(Collectors.toMap(Skill::getId, Function.identity()));
        for (int i = 0; i < ids.size(); i++) {
            Skill skill = byId.get(ids.get(i));
            if (skill == null) {
                throw NotFoundException.of("Skill", ids.get(i));
            }
            skill.setSortOrder(i);
        }
        repository.saveAll(byId.values());
    }

    private void apply(Skill skill, SkillRequest request) {
        skill.setName(request.name());
        skill.setCategory(request.category());
        skill.setProficiency(request.proficiency());
        skill.setIcon(request.icon());
    }

    private SkillResponse toResponse(Skill s) {
        return new SkillResponse(s.getId(), s.getName(), s.getCategory(), s.getProficiency(),
                s.getIcon(), s.getSortOrder());
    }
}
