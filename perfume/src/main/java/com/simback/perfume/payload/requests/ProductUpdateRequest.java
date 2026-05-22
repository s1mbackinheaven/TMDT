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

/** Request cập nhật sản phẩm. Các trường null có thể giữ nguyên (patch) hoặc clear tùy quy ước. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequest {
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

    /** Biến thể: gửi đủ list mới (sẽ replace toàn bộ variant hiện tại). */
    @Valid
    private List<ProductCreateRequest.ProductVariantRequest> variants;

    /** Danh sách URL ảnh (replace toàn bộ ảnh; thứ tự = sortOrder). */
    private List<String> imageUrls;

    /** Id các tag (replace). */
    private List<Long> tagIds;
}
