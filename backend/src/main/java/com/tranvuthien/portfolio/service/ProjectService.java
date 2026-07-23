package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Project;
import com.tranvuthien.portfolio.dto.ProjectRequest;
import com.tranvuthien.portfolio.dto.ProjectResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.repository.ProjectRepository;
import com.tranvuthien.portfolio.util.Csv;
import com.tranvuthien.portfolio.util.Lines;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository repository;

    public ProjectService(ProjectRepository repository) {
        this.repository = repository;
    }

    @Cacheable(CacheConfig.PROJECTS)
    @Transactional(readOnly = true)
    public List<ProjectResponse> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream().map(this::toResponse).toList();
    }

    @CacheEvict(cacheNames = CacheConfig.PROJECTS, allEntries = true)
    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        Project project = new Project();
        apply(project, request);
        project.setSortOrder((int) repository.count());
        return toResponse(repository.save(project));
    }

    @CacheEvict(cacheNames = CacheConfig.PROJECTS, allEntries = true)
    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request) {
        Project project = repository.findById(id).orElseThrow(() -> NotFoundException.of("Project", id));
        apply(project, request);
        return toResponse(repository.save(project));
    }

    @CacheEvict(cacheNames = CacheConfig.PROJECTS, allEntries = true)
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw NotFoundException.of("Project", id);
        }
        repository.deleteById(id);
    }

    @CacheEvict(cacheNames = CacheConfig.PROJECTS, allEntries = true)
    @Transactional
    public void reorder(List<Long> ids) {
        Map<Long, Project> byId = repository.findAllById(ids).stream()
                .collect(Collectors.toMap(Project::getId, Function.identity()));
        for (int i = 0; i < ids.size(); i++) {
            Project project = byId.get(ids.get(i));
            if (project == null) {
                throw NotFoundException.of("Project", ids.get(i));
            }
            project.setSortOrder(i);
        }
        repository.saveAll(byId.values());
    }

    private void apply(Project project, ProjectRequest request) {
        project.setName(request.name());
        project.setPeriod(request.period());
        project.setDescription(request.description());
        project.setTechStack(Csv.toCsv(request.techStack()));
        project.setImageUrl(request.imageUrl());
        project.setGalleryUrls(Lines.toJoined(request.galleryUrls()));
        project.setHighlights(Lines.toJoined(request.highlights()));
        project.setDemoUrl(request.demoUrl());
        project.setRepoUrl(request.repoUrl());
        project.setFeatured(request.featured());
    }

    private ProjectResponse toResponse(Project p) {
        return new ProjectResponse(p.getId(), p.getName(), p.getPeriod(), p.getDescription(),
                Csv.toList(p.getTechStack()), p.getImageUrl(), Lines.toList(p.getGalleryUrls()),
                Lines.toList(p.getHighlights()), p.getDemoUrl(), p.getRepoUrl(),
                p.isFeatured(), p.getSortOrder());
    }
}
