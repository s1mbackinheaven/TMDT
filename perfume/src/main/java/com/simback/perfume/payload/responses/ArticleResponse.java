package com.simback.perfume.payload.responses;

import com.simback.perfume.model.ArticleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String thumbnailUrl;
    private String excerpt;
    private ArticleStatus status;
    private Boolean featured;
    private String categoryName;
    private String tagNames;
    private Instant createdAt;
    private Instant updatedAt;
}
