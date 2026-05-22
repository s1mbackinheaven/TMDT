package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private Long variantId;
    private String productName;
    private String variantVolume;
    private String thumbnail;
    private BigDecimal unitPrice;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private Integer quantity;
    private BigDecimal lineTotal;
}
