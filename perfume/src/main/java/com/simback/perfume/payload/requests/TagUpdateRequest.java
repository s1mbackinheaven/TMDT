package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request cập nhật tag. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagUpdateRequest {
    @NotBlank(message = "Tên tag không được để trống")
    private String name;
    @NotBlank(message = "Slug không được để trống")
    private String slug;
}
