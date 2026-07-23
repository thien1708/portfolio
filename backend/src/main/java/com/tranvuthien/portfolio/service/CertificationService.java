package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.domain.Certification;
import com.tranvuthien.portfolio.dto.CertificationRequest;
import com.tranvuthien.portfolio.dto.CertificationResponse;
import com.tranvuthien.portfolio.repository.CertificationRepository;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class CertificationService extends AbstractCrudService<Certification, CertificationRequest, CertificationResponse> {

    public CertificationService(CertificationRepository repository, CacheManager cacheManager) {
        super(repository, cacheManager, CacheConfig.CERTIFICATIONS, "Certification");
    }

    @Override
    protected Certification newEntity() {
        return new Certification();
    }

    @Override
    protected void apply(Certification certification, CertificationRequest request) {
        certification.setName(request.name());
        certification.setIssuer(request.issuer());
        certification.setIssued(request.issued());
        certification.setUrl(request.url());
    }

    @Override
    protected CertificationResponse toResponse(Certification c) {
        return new CertificationResponse(c.getId(), c.getName(), c.getIssuer(), c.getIssued(),
                c.getUrl(), c.getSortOrder());
    }
}
