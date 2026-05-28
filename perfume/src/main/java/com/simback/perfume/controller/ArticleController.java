package com.simback.perfume.controller;

import com.simback.perfume.payload.responses.ArticleResponse;
import com.simback.perfume.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<List<ArticleResponse>> getPublished(@RequestParam(value = "q", required = false) String q,
                                                               @RequestParam(value = "categoryName", required = false) String categoryName) {
        return ResponseEntity.ok(articleService.getPublished(q, categoryName));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ArticleResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getBySlug(slug));
    }
}
