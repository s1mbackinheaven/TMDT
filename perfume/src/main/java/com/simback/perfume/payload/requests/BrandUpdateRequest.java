package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request cập nhật thương hiệu. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandUpdateRequest {
    @NotBlank(message = "Tên thương hiệu không được để trống")
    private String name;
    @NotBlank(message = "Slug không được để trống")
    private String slug;
}
