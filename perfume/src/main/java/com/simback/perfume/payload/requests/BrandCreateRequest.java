package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request tạo/cập nhật thương hiệu. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandCreateRequest {
    @NotBlank(message = "Tên thương hiệu không được để trống")
    private String name;
    /** URL thân thiện, VD: dior. Nếu trống có thể tự sinh từ name. */
    private String slug;
}
