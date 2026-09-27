package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.Post;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends SortedEntityRepository<Post> {

    Optional<Post> findBySlug(String slug);

    List<Post> findAllByPublishedTrueOrderBySortOrderAscIdAsc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    @Modifying
    @Query("UPDATE Post p SET p.viewsCount = p.viewsCount + 1 WHERE p.id = :id")
    void incrementViews(@Param("id") Long id);
}
