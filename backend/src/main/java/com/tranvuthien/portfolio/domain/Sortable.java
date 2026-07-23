package com.tranvuthien.portfolio.domain;

/** An entity ordered by an admin-managed sort position. */
public interface Sortable {

    Long getId();

    int getSortOrder();

    void setSortOrder(int sortOrder);
}
