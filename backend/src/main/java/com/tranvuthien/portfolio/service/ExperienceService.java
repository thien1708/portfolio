package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Experience;
import com.tranvuthien.portfolio.dto.ExperienceRequest;
import com.tranvuthien.portfolio.dto.ExperienceResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.ExperienceRepository;
import com.tranvuthien.portfolio.util.Csv;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExperienceService {

    private final ExperienceRepository repository;

    public ExperienceService(ExperienceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ExperienceResponse> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ExperienceResponse create(ExperienceRequest request) {
        Experience experience = new Experience();
        apply(experience, request);
        experience.setSortOrder((int) repository.count());
        return toResponse(repository.save(experience));
    }

    @Transactional
    public ExperienceResponse update(Long id, ExperienceRequest request) {
        Experience experience = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Experience", id));
        apply(experience, request);
        return toResponse(repository.save(experience));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Experience", id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public void reorder(List<Long> ids) {
        Map<Long, Experience> byId = repository.findAllById(ids).stream()
                .collect(Collectors.toMap(Experience::getId, Function.identity()));
        for (int i = 0; i < ids.size(); i++) {
            Experience experience = byId.get(ids.get(i));
            if (experience == null) {
                throw NotFoundException.of("Experience", ids.get(i));
            }
            experience.setSortOrder(i);
        }
        repository.saveAll(byId.values());
    }

    private void apply(Experience experience, ExperienceRequest request) {
        experience.setCompany(request.company());
        experience.setRole(request.role());
        experience.setPeriod(request.period());
        experience.setDescription(request.description());
        experience.setTechStack(Csv.toCsv(request.techStack()));
    }

    private ExperienceResponse toResponse(Experience e) {
        return new ExperienceResponse(e.getId(), e.getCompany(), e.getRole(), e.getPeriod(),
                e.getDescription(), Csv.toList(e.getTechStack()), e.getSortOrder());
    }
}
