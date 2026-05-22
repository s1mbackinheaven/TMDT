package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request tạo/cập nhật nhóm hương. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScentFamilyCreateRequest {
    @NotBlank(message = "Tên nhóm hương không được để trống")
    private String name;
    private String slug;
}
