package com.simback.perfume.repository;

import com.simback.perfume.model.Article;
import com.simback.perfume.model.ArticleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Article> findByStatusOrderByCreatedAtDesc(ArticleStatus status);
    List<Article> findByFeaturedTrueOrderByCreatedAtDesc();
}
