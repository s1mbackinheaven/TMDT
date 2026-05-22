package com.simback.perfume.payload.responses;

import java.math.BigDecimal;

public record VariantOptionResponse(
        Long variantId,
        String volume,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer discountPercent,
        Integer stockQuantity,
        Boolean selected
) {}
