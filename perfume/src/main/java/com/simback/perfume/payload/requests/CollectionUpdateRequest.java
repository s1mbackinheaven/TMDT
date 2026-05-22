package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request cập nhật bộ sưu tập. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionUpdateRequest {
    @NotBlank(message = "Tên bộ sưu tập không được để trống")
    private String name;
    @NotBlank(message = "Slug không được để trống")
    private String slug;
}
