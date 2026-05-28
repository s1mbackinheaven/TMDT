package com.simback.perfume.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "articles", indexes = {
        @Index(name = "idx_articles_slug", columnList = "slug"),
        @Index(name = "idx_articles_status_created_at", columnList = "status,created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "article_seq")
    @SequenceGenerator(name = "article_seq", sequenceName = "article_sequence", allocationSize = 1)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 1000)
    private String thumbnailUrl;

    @Column(length = 500)
    private String excerpt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;

    @Column(nullable = false)
    private String categoryName;

    @Column(nullable = false)
    private String tagNames;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
