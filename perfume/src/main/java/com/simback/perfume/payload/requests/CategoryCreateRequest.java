package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request tạo/cập nhật danh mục. parentId = null hoặc không gửi = category cha. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryCreateRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;
    /** URL thân thiện. Nếu trống có thể tự sinh từ name. */
    private String slug;
    /** Id danh mục cha (subcategory thì gửi id cha). */
    private Long parentId;
}
