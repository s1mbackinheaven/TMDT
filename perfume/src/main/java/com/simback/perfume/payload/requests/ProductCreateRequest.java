package com.simback.perfume.payload.requests;

import com.simback.perfume.model.Concentration;
import com.simback.perfume.model.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Request tạo sản phẩm mới. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    @NotNull(message = "Thương hiệu không được null")
    private Long brandId;

    @NotNull(message = "Danh mục không được null")
    private Long categoryId;

    private Long collectionId;
    private Long scentFamilyId;

    @NotNull(message = "Nồng độ không được null")
    private Concentration concentration;

    private String description;
    private String shortDescription;
    private String topNotes;
    private String heartNotes;
    private String baseNotes;
    private Integer releaseYear;

    @NotNull(message = "Trạng thái không được null")
    private ProductStatus status;

    private String thumbnail;
    private String video;

    /**
     * Danh sách URL ảnh sản phẩm (nhiều ảnh).
     * Thứ tự trong list = thứ tự hiển thị (sortOrder). Có thể dùng ảnh đầu làm thumbnail.
     */
    private List<String> imageUrls;

    /** Id các tag. */
    private List<Long> tagIds;

    /** Danh sách biến thể (volume, price, ...). Ít nhất 1 variant. */
    @Valid
    @NotNull(message = "Cần ít nhất một biến thể")
    private List<ProductVariantRequest> variants;

    /** DTO nhỏ cho 1 variant trong request. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantRequest {
        @NotBlank(message = "Dung tích không được để trống")
        private String volume;
        /**
         * Giá bán cuối cùng sẽ được tự động tính khi có originalPrice + discountPercent.
         * Nếu không có giảm giá thì có thể dùng trực tiếp price hoặc originalPrice.
         */
        private java.math.BigDecimal price;
        private java.math.BigDecimal originalPrice;
        private Integer discountPercent;
        @NotNull(message = "Tồn kho không được null")
        private Integer stockQuantity;
        private String sku;
        private Integer sortOrder;
    }
}
