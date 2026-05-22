package com.simback.perfume.payload.responses;

import com.simback.perfume.model.CartItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private Long variantId;
    private String productName;
    private String productSlug;
    private String variantVolume;
    private String thumbnail;
    private BigDecimal unitPrice;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private Integer quantity;
    private Integer availableStock;
    private BigDecimal lineSubtotal;
    private CartItemStatus status;
    private List<VariantOptionResponse> variantOptions;
}
