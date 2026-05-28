package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.Article;
import com.simback.perfume.model.ArticleStatus;
import com.simback.perfume.payload.requests.ArticleCreateRequest;
import com.simback.perfume.payload.requests.ArticleUpdateRequest;
import com.simback.perfume.payload.responses.ArticleResponse;
import com.simback.perfume.payload.requests.ArticleMultipartCreateRequest;
import com.simback.perfume.payload.requests.ArticleMultipartUpdateRequest;
import com.simback.perfume.payload.responses.UploadResponse;
import com.simback.perfume.repository.ArticleRepository;
import com.simback.perfume.repository.CategoryRepository;
import com.simback.perfume.repository.TagRepository;
import com.simback.perfume.service.ArticleService;
import com.simback.perfume.service.MediaService;
import com.simback.perfume.service.NotificationService;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {
    private final ArticleRepository articleRepository;
    private final MediaService mediaService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ArticleResponse create(ArticleCreateRequest request) {
        Article article = Article.builder()
                .title(request.getTitle().trim())
                .slug(generateSlug(request.getTitle(), null))
                .content(request.getContent())
                .thumbnailUrl(request.getThumbnailUrl())
                .excerpt(request.getExcerpt())
                .categoryName(request.getCategoryName().trim())
                .tagNames(normalizeNames(request.getTagNames()))
                .status(request.getStatus() != null ? request.getStatus() : ArticleStatus.DRAFT)
                .featured(request.getFeatured() != null && request.getFeatured())
                .build();
        article = articleRepository.save(article);
        notificationService.broadcast(
                "Bài viết mới",
                "Vừa có bài viết mới: " + article.getTitle(),
                "/news/" + article.getSlug(),
                article.getThumbnailUrl(),
                com.simback.perfume.model.NotificationType.ARTICLE.name()
        );
        return toResponse(article);
    }

    @Override
    @Transactional
    public ArticleResponse createMultipart(ArticleMultipartCreateRequest request, List<MultipartFile> images) {
        String content = injectImages(request.getContent(), request.getThumbnailPlaceholder(), images);
        ArticleCreateRequest base = ArticleCreateRequest.builder()
                .title(request.getTitle())
                .content(content)
                .thumbnailUrl(firstImageUrl(images))
                .excerpt(request.getExcerpt())
                .categoryName(request.getCategoryName())
                .tagNames(request.getTagNames())
                .status(request.getStatus())
                .featured(request.getFeatured())
                .build();
        return create(base);
    }

    @Override
    @Transactional
    public ArticleResponse update(Long id, ArticleUpdateRequest request) {
        Article article = getArticle(id);
        article.setTitle(request.getTitle().trim());
        article.setSlug(generateSlug(request.getTitle(), id));
        article.setContent(request.getContent());
        article.setThumbnailUrl(request.getThumbnailUrl());
        article.setExcerpt(request.getExcerpt());
        article.setCategoryName(request.getCategoryName().trim());
        article.setTagNames(normalizeNames(request.getTagNames().trim()));
        article.setStatus(request.getStatus() != null ? request.getStatus() : article.getStatus());
        article.setFeatured(request.getFeatured() != null ? request.getFeatured() : article.getFeatured());
        article = articleRepository.save(article);
        return toResponse(article);
    }

    @Override
    @Transactional
    public ArticleResponse updateMultipart(Long id, ArticleMultipartUpdateRequest request, List<MultipartFile> images) {
        String content = injectImages(request.getContent(), request.getThumbnailPlaceholder(), images);
        ArticleUpdateRequest base = ArticleUpdateRequest.builder()
                .title(request.getTitle())
                .content(content)
                .thumbnailUrl(firstImageUrl(images))
                .excerpt(request.getExcerpt())
                .categoryName(request.getCategoryName())
                .tagNames(request.getTagNames())
                .status(request.getStatus())
                .featured(request.getFeatured())
                .build();
        return update(id, base);
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleResponse getById(Long id) {
        return toResponse(getArticle(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleResponse getBySlug(String slug) {
        return toResponse(articleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết slug: " + slug)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getAll() {
        return articleRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getPublished(String q, String categoryName) {
        String query = q == null ? "" : q.trim().toLowerCase();
        String categoryFilter = categoryName == null ? "" : categoryName.trim().toLowerCase();
        return articleRepository.findByStatusOrderByCreatedAtDesc(ArticleStatus.PUBLISHED).stream()
                .filter(article -> query.isBlank() || matchesQuery(article, query))
                .filter(article -> categoryFilter.isBlank()
                        || safeLower(article.getCategoryName()).equals(categoryFilter))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Article article = getArticle(id);
        articleRepository.delete(article);
    }

    private Article getArticle(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài viết id: " + id));
    }

    private String normalizeNames(String raw) {
        if (raw == null)
            return null;
        return raw.lines()
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .map(line -> line.replaceFirst("^[-•\\d.\\s]+", ""))
                .collect(Collectors.joining(", "));
    }

    private boolean matchesQuery(Article article, String query) {
        return safeLower(article.getTitle()).contains(query)
                || safeLower(article.getContent()).contains(query)
                || safeLower(article.getCategoryName()).contains(query)
                || safeLower(article.getTagNames()).contains(query);
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase();
    }

    private String injectImages(String content, String placeholder, List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return content;
        }
        String result = content;
        for (int i = 0; i < images.size(); i++) {
            UploadResponse uploaded = mediaService.uploadImage(images.get(i));
            String token = placeholder != null && !placeholder.isBlank() ? placeholder + i : "[[image:" + i + "]]";
            String imgTag = "<img src=\"" + uploaded.getUrl() + "\" alt=\"article-image-" + i + "\" />";
            result = result.replace(token, imgTag);
        }
        return result;
    }

    private String firstImageUrl(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return mediaService.uploadImage(images.get(0)).getUrl();
    }

    private String generateSlug(String title, Long id) {
        String base = title.trim().toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
        String slug = base;
        if (id != null) {
            slug = base + "-" + id;
        }
        if (articleRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }
        return slug;
    }

    private ArticleResponse toResponse(Article article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .content(article.getContent())
                .thumbnailUrl(article.getThumbnailUrl())
                .excerpt(article.getExcerpt())
                .status(article.getStatus())
                .featured(article.getFeatured())
                .categoryName(article.getCategoryName())
                .tagNames(article.getTagNames())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
