package com.simback.perfume.service;

import com.simback.perfume.model.ProductVariant;

import java.math.BigDecimal;

public interface PricingService {
    /**
     * Calculates the effective price for a product variant by applying both its inherent discount
     * and any active global/brand-specific campaign discounts.
     */
    BigDecimal calculateEffectivePrice(ProductVariant variant);

    /**
     * Calculates the total effective discount percent for a product variant.
     */
    Integer calculateEffectiveDiscountPercent(ProductVariant variant);
}
