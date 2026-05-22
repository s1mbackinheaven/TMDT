package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request tạo/cập nhật tag. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagCreateRequest {
    @NotBlank(message = "Tên tag không được để trống")
    private String name;
    private String slug;
}
