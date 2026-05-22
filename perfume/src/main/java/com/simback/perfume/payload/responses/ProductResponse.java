package com.simback.perfume.payload.responses;

import com.simback.perfume.model.Concentration;
import com.simback.perfume.model.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** DTO chi tiết sản phẩm (GET by id / slug).
 * Ảnh: thumbnail = 1 URL ảnh đại diện; images = danh sách đầy đủ ảnh (id, url, sortOrder). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private BrandDto brand;
    private CategoryDto category;
    private CollectionDto collection;
    private ScentFamilyDto scentFamily;
    private Concentration concentration;
    private String description;
    private String shortDescription;
    private String topNotes;
    private String heartNotes;
    private String baseNotes;
    private Integer releaseYear;
    private ProductStatus status;
    /** Ảnh đại diện (1 URL). */
    private String thumbnail;
    private String video;
    private BigDecimal ratingAvg;
    private Integer reviewCount;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ProductVariantDto> variants;
    /** Danh sách ảnh sản phẩm (nhiều ảnh, mỗi phần tử có id, url, sortOrder). */
    private List<ProductImageDto> images;
    private List<TagDto> tags;
}
