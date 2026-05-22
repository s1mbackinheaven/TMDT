package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO một ảnh trong danh sách ảnh sản phẩm (id, url, sortOrder). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageDto {
    private Long id;
    private String url;
    private Integer sortOrder;
}
