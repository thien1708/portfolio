package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Sortable;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.SortedEntityRepository;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Shared list/create/update/delete/reorder logic for the admin-sortable
 * content types (skills, experiences, projects, education, certifications).
 * The public list is cached; every mutation clears that cache. Caching is
 * programmatic (not annotation-based) because the cache name is per-subclass.
 */
public abstract class AbstractCrudService<E extends Sortable, Req, Res> {

    private static final String LIST_KEY = "all";

    protected final SortedEntityRepository<E> repository;
    private final Cache cache;
    private final String resourceName;

    protected AbstractCrudService(SortedEntityRepository<E> repository, CacheManager cacheManager,
                                  String cacheName, String resourceName) {
        this.repository = repository;
        this.cache = Objects.requireNonNull(cacheManager.getCache(cacheName),
                "Cache not configured: " + cacheName);
        this.resourceName = resourceName;
    }

    protected abstract E newEntity();

    protected abstract void apply(E entity, Req request);

    protected abstract Res toResponse(E entity);

    @Transactional(readOnly = true)
    public List<Res> list() {
        return cache.get(LIST_KEY, () ->
                repository.findAllByOrderBySortOrderAscIdAsc().stream().map(this::toResponse).toList());
    }

    @Transactional
    public Res create(Req request) {
        E entity = newEntity();
        apply(entity, request);
        entity.setSortOrder(repository.nextSortOrder());
        Res response = toResponse(repository.save(entity));
        cache.clear();
        return response;
    }

    @Transactional
    public Res update(Long id, Req request) {
        E entity = repository.findById(id).orElseThrow(() -> NotFoundException.of(resourceName, id));
        apply(entity, request);
        cache.clear();
        return toResponse(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of(resourceName, id);
        }
        repository.deleteById(id);
        cache.clear();
    }

    @Transactional
    public void reorder(List<Long> ids) {
        if (new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Reorder request contains duplicate ids");
        }
        if (ids.size() != repository.count()) {
            throw new IllegalArgumentException(
                    "Reorder must include every " + resourceName + " id exactly once");
        }
        Map<Long, E> byId = repository.findAllById(ids).stream()
                .collect(Collectors.toMap(Sortable::getId, Function.identity()));
        for (int i = 0; i < ids.size(); i++) {
            E entity = byId.get(ids.get(i));
            if (entity == null) {
                throw NotFoundException.of(resourceName, ids.get(i));
            }
            entity.setSortOrder(i);
        }
        repository.saveAll(byId.values());
        cache.clear();
    }
}
