package com.simback.perfume.payload.responses;

import com.simback.perfume.model.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** DTO sản phẩm trong danh sách (list + filter). Giá có thể là giá thấp nhất trong các variant. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductListResponse {
    private Long id;
    private String name;
    private String slug;
    private String thumbnail;
    private String brandName;
    private String categoryName;
    private BigDecimal minPrice;
    private BigDecimal ratingAvg;
    private Integer reviewCount;
    private ProductStatus status;
}
