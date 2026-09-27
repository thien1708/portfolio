package com.tranvuthien.portfolio.web.admin;

import com.tranvuthien.portfolio.dto.PostRequest;
import com.tranvuthien.portfolio.dto.PostResponse;
import com.tranvuthien.portfolio.dto.ReorderRequest;
import com.tranvuthien.portfolio.service.PostService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/posts")
@Tag(name = "Admin – Blog Posts")
@SecurityRequirement(name = "bearerAuth")
public class AdminPostController {

    private final PostService postService;

    public AdminPostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(@Valid @RequestBody PostRequest request) {
        return postService.create(request);
    }

    @PutMapping("/{id}")
    public PostResponse update(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
        return postService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }

    @PutMapping("/reorder")
    public void reorder(@Valid @RequestBody ReorderRequest request) {
        postService.reorder(request.ids());
    }
}
