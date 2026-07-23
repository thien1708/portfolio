package com.tranvuthien.portfolio.repository;

import com.tranvuthien.portfolio.domain.Sortable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

/** Shared contract for the admin-sortable content repositories. */
@NoRepositoryBean
public interface SortedEntityRepository<E extends Sortable> extends JpaRepository<E, Long> {

    List<E> findAllByOrderBySortOrderAscIdAsc();

    /**
     * Next append position: max(sortOrder) + 1, or 0 for an empty table.
     * Unlike count(), this stays correct after deletions in the middle.
     */
    @Query("select coalesce(max(e.sortOrder), -1) + 1 from #{#entityName} e")
    int nextSortOrder();
}
