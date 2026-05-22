package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request cập nhật danh mục. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryUpdateRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;
    @NotBlank(message = "Slug không được để trống")
    private String slug;
    /** Id danh mục cha; null = thành category gốc. */
    private Long parentId;
}
