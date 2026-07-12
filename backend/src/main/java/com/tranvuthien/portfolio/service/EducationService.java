package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Education;
import com.tranvuthien.portfolio.dto.EducationRequest;
import com.tranvuthien.portfolio.dto.EducationResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.EducationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EducationService {

    private final EducationRepository repository;

    public EducationService(EducationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<EducationResponse> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public EducationResponse create(EducationRequest request) {
        Education education = new Education();
        apply(education, request);
        education.setSortOrder((int) repository.count());
        return toResponse(repository.save(education));
    }

    @Transactional
    public EducationResponse update(Long id, EducationRequest request) {
        Education education = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Education", id));
        apply(education, request);
        return toResponse(repository.save(education));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Education", id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public void reorder(List<Long> ids) {
        Map<Long, Education> byId = repository.findAllById(ids).stream()
                .collect(Collectors.toMap(Education::getId, Function.identity()));
        for (int i = 0; i < ids.size(); i++) {
            Education education = byId.get(ids.get(i));
            if (education == null) {
                throw NotFoundException.of("Education", ids.get(i));
            }
            education.setSortOrder(i);
        }
        repository.saveAll(byId.values());
    }

    private void apply(Education education, EducationRequest request) {
        education.setSchool(request.school());
        education.setDegree(request.degree());
        education.setPeriod(request.period());
        education.setDescription(request.description());
    }

    private EducationResponse toResponse(Education e) {
        return new EducationResponse(e.getId(), e.getSchool(), e.getDegree(), e.getPeriod(),
                e.getDescription(), e.getSortOrder());
    }
}
