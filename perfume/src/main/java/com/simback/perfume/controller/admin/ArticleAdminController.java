package com.simback.perfume.controller.admin;

import com.simback.perfume.payload.requests.ArticleCreateRequest;
import com.simback.perfume.payload.requests.ArticleMultipartCreateRequest;
import com.simback.perfume.payload.requests.ArticleMultipartUpdateRequest;
import com.simback.perfume.payload.requests.ArticleUpdateRequest;
import com.simback.perfume.payload.responses.ArticleResponse;
import com.simback.perfume.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/articles")
@RequiredArgsConstructor
public class ArticleAdminController {
    private final ArticleService articleService;

    @PostMapping
    public ResponseEntity<ArticleResponse> create(@Valid @RequestBody ArticleCreateRequest request) {
        return ResponseEntity.ok(articleService.create(request));
    }

    @PostMapping(value = "/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleResponse> createMultipart(@RequestPart("request") @Valid ArticleMultipartCreateRequest request,
                                                            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(articleService.createMultipart(request, images));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleResponse> update(@PathVariable Long id, @Valid @RequestBody ArticleUpdateRequest request) {
        return ResponseEntity.ok(articleService.update(id, request));
    }

    @PutMapping(value = "/{id}/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleResponse> updateMultipart(@PathVariable Long id,
                                                           @RequestPart("request") @Valid ArticleMultipartUpdateRequest request,
                                                           @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(articleService.updateMultipart(id, request, images));
    }

    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getAll() {
        return ResponseEntity.ok(articleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        articleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
