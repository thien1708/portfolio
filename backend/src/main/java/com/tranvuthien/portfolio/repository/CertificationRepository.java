package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findAllByOrderBySortOrderAscIdAsc();
}
