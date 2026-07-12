package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.Education;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findAllByOrderBySortOrderAscIdAsc();
}
