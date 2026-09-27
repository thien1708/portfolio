package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.config.CacheConfig;
import com.tranvuthien.portfolio.domain.Post;
import com.tranvuthien.portfolio.dto.PostRequest;
import com.tranvuthien.portfolio.dto.PostResponse;
import com.tranvuthien.portfolio.exception.BadRequestException;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.PostRepository;
import com.tranvuthien.portfolio.util.Csv;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
public class PostService extends AbstractCrudService<Post, PostRequest, PostResponse> {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final String PUBLISHED_LIST_KEY = "published_all";

    private final PostRepository postRepository;
    private final Cache postCache;

    public PostService(PostRepository repository, CacheManager cacheManager) {
        super(repository, cacheManager, CacheConfig.POSTS, "Post");
        this.postRepository = repository;
        this.postCache = Objects.requireNonNull(cacheManager.getCache(CacheConfig.POSTS),
                "Cache not configured: " + CacheConfig.POSTS);
    }

    @Override
    protected Post newEntity() {
        return new Post();
    }

    @Override
    protected void apply(Post post, PostRequest request) {
        post.setTitle(request.title().trim());

        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = slugify(request.title());
        } else {
            slug = slugify(slug);
        }

        // Validate slug uniqueness
        if (post.getId() == null) {
            if (postRepository.existsBySlug(slug)) {
                slug = slug + "-" + System.currentTimeMillis() % 10000;
            }
        } else {
            if (postRepository.existsBySlugAndIdNot(slug, post.getId())) {
                throw new BadRequestException("A post with slug '" + slug + "' already exists");
            }
        }
        post.setSlug(slug);

        post.setSummary(request.summary() != null ? request.summary().trim() : null);
        post.setContent(request.content().trim());
        post.setCoverImageUrl(request.coverImageUrl());
        post.setTags(Csv.toCsv(request.tags()));
        post.setPublished(request.published());

        if (request.readingTimeMinutes() != null && request.readingTimeMinutes() > 0) {
            post.setReadingTimeMinutes(request.readingTimeMinutes());
        } else {
            post.setReadingTimeMinutes(estimateReadingTime(request.content()));
        }
    }

    @Override
    protected PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getContent(),
                post.getCoverImageUrl(),
                Csv.toList(post.getTags()),
                post.isPublished(),
                post.getViewsCount(),
                post.getReadingTimeMinutes(),
                post.getSortOrder(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<PostResponse> listPublished() {
        return postCache.get(PUBLISHED_LIST_KEY, () ->
                postRepository.findAllByPublishedTrueOrderBySortOrderAscIdAsc()
                        .stream().map(this::toResponse).toList());
    }

    @Transactional
    public PostResponse getBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Post not found with slug: " + slug));

        if (!post.isPublished()) {
            throw new NotFoundException("Post not found with slug: " + slug);
        }

        postRepository.incrementViews(post.getId());
        post.setViewsCount(post.getViewsCount() + 1);
        return toResponse(post);
    }

    public static String slugify(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");
    }

    private int estimateReadingTime(String content) {
        if (content == null || content.isBlank()) return 1;
        String[] words = content.trim().split("\\s+");
        int count = words.length;
        return Math.max(1, (int) Math.ceil(count / 200.0));
    }
}
