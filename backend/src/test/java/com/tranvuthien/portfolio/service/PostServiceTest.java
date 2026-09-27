package com.tranvuthien.portfolio.service;

import com.tranvuthien.portfolio.domain.Post;
import com.tranvuthien.portfolio.dto.PostRequest;
import com.tranvuthien.portfolio.dto.PostResponse;
import com.tranvuthien.portfolio.exception.NotFoundException;
import com.tranvuthien.portfolio.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository repository;

    private PostService service;

    @BeforeEach
    void setUp() {
        service = new PostService(repository, new ConcurrentMapCacheManager());
    }

    private Post post(Long id, String title, String slug, boolean published) {
        Post p = new Post();
        p.setId(id);
        p.setTitle(title);
        p.setSlug(slug);
        p.setContent("Test content for post with some words");
        p.setPublished(published);
        p.setReadingTimeMinutes(3);
        p.setSortOrder(0);
        return p;
    }

    @Test
    void slugifyConvertsSpecialCharsAndVietnameseAccents() {
        assertThat(PostService.slugify("Xây dựng Backend Spring Boot 3.5 & Java 21!"))
                .isEqualTo("xay-dung-backend-spring-boot-35-java-21");
    }

    @Test
    void getBySlugIncrementsViews() {
        Post p = post(1L, "Architecture", "architecture", true);
        when(repository.findBySlug("architecture")).thenReturn(Optional.of(p));

        PostResponse response = service.getBySlug("architecture");

        assertThat(response.slug()).isEqualTo("architecture");
        assertThat(response.viewsCount()).isEqualTo(1);
        verify(repository).incrementViews(1L);
    }

    @Test
    void getBySlugThrowsWhenUnpublished() {
        Post p = post(1L, "Draft Post", "draft-post", false);
        when(repository.findBySlug("draft-post")).thenReturn(Optional.of(p));

        assertThatThrownBy(() -> service.getBySlug("draft-post"))
                .isInstanceOf(NotFoundException.class);
    }
}
