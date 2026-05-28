package com.simback.perfume.payload.requests;

import com.simback.perfume.model.ArticleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleMultipartUpdateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @NotBlank(message = "Category không được trống")
    private String categoryName;

    @NotBlank(message = "Tag không được trống")
    private String tagNames;
    private ArticleStatus status;
    private Boolean featured;
    private String excerpt;
    private String thumbnailPlaceholder;
}
