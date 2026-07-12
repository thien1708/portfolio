package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findFirstByOrderByIdAsc();
}
