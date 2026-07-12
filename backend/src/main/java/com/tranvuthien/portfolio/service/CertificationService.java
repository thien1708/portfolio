package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Certification;
import com.tranvuthien.portfolio.dto.CertificationRequest;
import com.tranvuthien.portfolio.dto.CertificationResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.CertificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CertificationService {

    private final CertificationRepository repository;

    public CertificationService(CertificationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CertificationResponse> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CertificationResponse create(CertificationRequest request) {
        Certification certification = new Certification();
        apply(certification, request);
        certification.setSortOrder((int) repository.count());
        return toResponse(repository.save(certification));
    }

    @Transactional
    public CertificationResponse update(Long id, CertificationRequest request) {
        Certification certification = repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Certification", id));
        apply(certification, request);
        return toResponse(repository.save(certification));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Certification", id);
        }
        repository.deleteById(id);
    }

    @Transactional
    public void reorder(List<Long> ids) {
        Map<Long, Certification> byId = repository.findAllById(ids).stream()
                .collect(Collectors.toMap(Certification::getId, Function.identity()));
        for (int i = 0; i < ids.size(); i++) {
            Certification certification = byId.get(ids.get(i));
            if (certification == null) {
                throw NotFoundException.of("Certification", ids.get(i));
            }
            certification.setSortOrder(i);
        }
        repository.saveAll(byId.values());
    }

    private void apply(Certification certification, CertificationRequest request) {
        certification.setName(request.name());
        certification.setIssuer(request.issuer());
        certification.setIssued(request.issued());
        certification.setUrl(request.url());
    }

    private CertificationResponse toResponse(Certification c) {
        return new CertificationResponse(c.getId(), c.getName(), c.getIssuer(), c.getIssued(),
                c.getUrl(), c.getSortOrder());
    }
}
