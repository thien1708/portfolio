package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.domain.Project;
import com.tranvuthien.portfolio.dto.ProjectRequest;
import com.tranvuthien.portfolio.dto.ProjectResponse;
import com.tranvuthien.portfolio.repository.ProjectRepository;
import com.tranvuthien.portfolio.util.Csv;
import com.tranvuthien.portfolio.util.Lines;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
public class ProjectService extends AbstractCrudService<Project, ProjectRequest, ProjectResponse> {

    public ProjectService(ProjectRepository repository, CacheManager cacheManager) {
        super(repository, cacheManager, CacheConfig.PROJECTS, "Project");
    }

    @Override
    protected Project newEntity() {
        return new Project();
    }

    @Override
    protected void apply(Project project, ProjectRequest request) {
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

    @Override
    protected ProjectResponse toResponse(Project p) {
        return new ProjectResponse(p.getId(), p.getName(), p.getPeriod(), p.getDescription(),
                Csv.toList(p.getTechStack()), p.getImageUrl(), Lines.toList(p.getGalleryUrls()),
                Lines.toList(p.getHighlights()), p.getDemoUrl(), p.getRepoUrl(),
                p.isFeatured(), p.getSortOrder());
    }
}
