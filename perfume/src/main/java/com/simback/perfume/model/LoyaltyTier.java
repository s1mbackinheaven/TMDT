package com.simback.perfume.model;

import lombok.Getter;

@Getter
public enum LoyaltyTier {
    BRONZE(0, 0.0),        // 0 - 99 points, 0% discount
    SILVER(100, 0.05),     // 100 - 999 points, 5% discount
    GOLD(1000, 0.10),      // 1000 - 9999 points, 10% discount
    PLATINUM(10000, 0.15); // 10000+ points, 15% discount

    private final int minPoints;
    private final double discountRate;

    LoyaltyTier(int minPoints, double discountRate) {
        this.minPoints = minPoints;
        this.discountRate = discountRate;
    }

    public static LoyaltyTier calculateTier(int points) {
        if (points >= PLATINUM.getMinPoints()) return PLATINUM;
        if (points >= GOLD.getMinPoints()) return GOLD;
        if (points >= SILVER.getMinPoints()) return SILVER;
        return BRONZE;
    }
}
