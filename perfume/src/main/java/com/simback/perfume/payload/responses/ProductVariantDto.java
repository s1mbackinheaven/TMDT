package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** DTO biến thể sản phẩm (dung tích, giá, tồn kho). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDto {
    private Long id;
    private String volume;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private Integer stockQuantity;
    private Integer soldCount;
    private String sku;
    private Integer sortOrder;
}
