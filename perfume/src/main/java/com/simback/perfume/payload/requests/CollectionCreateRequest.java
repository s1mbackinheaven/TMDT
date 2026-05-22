package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request tạo/cập nhật bộ sưu tập. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionCreateRequest {
    @NotBlank(message = "Tên bộ sưu tập không được để trống")
    private String name;
    private String slug;
}
