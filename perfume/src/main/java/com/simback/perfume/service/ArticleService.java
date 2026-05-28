package com.simback.perfume.service;

import com.simback.perfume.payload.requests.ArticleCreateRequest;
import com.simback.perfume.payload.requests.ArticleMultipartCreateRequest;
import com.simback.perfume.payload.requests.ArticleMultipartUpdateRequest;
import com.simback.perfume.payload.requests.ArticleUpdateRequest;
import com.simback.perfume.payload.responses.ArticleResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ArticleService {
    ArticleResponse create(ArticleCreateRequest request);
    ArticleResponse createMultipart(ArticleMultipartCreateRequest request, List<MultipartFile> images);
    ArticleResponse update(Long id, ArticleUpdateRequest request);
    ArticleResponse updateMultipart(Long id, ArticleMultipartUpdateRequest request, List<MultipartFile> images);
    ArticleResponse getById(Long id);
    ArticleResponse getBySlug(String slug);
    List<ArticleResponse> getAll();
    List<ArticleResponse> getPublished(String q, String categoryName);
    void delete(Long id);
}
