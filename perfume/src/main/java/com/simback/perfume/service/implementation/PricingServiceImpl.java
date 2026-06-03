package com.simback.perfume.service.implementation;

import com.simback.perfume.model.Product;
import com.simback.perfume.model.ProductVariant;
import com.simback.perfume.payload.responses.CampaignDto;
import com.simback.perfume.service.CampaignService;
import com.simback.perfume.service.PricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService {

    private final CampaignService campaignService;

    @Override
    public BigDecimal calculateEffectivePrice(ProductVariant variant) {
        if (variant == null) return null;
        BigDecimal basePrice = variant.getOriginalPrice() != null ? variant.getOriginalPrice() : variant.getPrice();
        if (basePrice == null) return null;

        Integer effectiveDiscount = calculateEffectiveDiscountPercent(variant);
        
        if (effectiveDiscount == null || effectiveDiscount <= 0) {
            return basePrice;
        }

        BigDecimal discountFactor = BigDecimal.valueOf(100 - effectiveDiscount)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                
        return basePrice.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public Integer calculateEffectiveDiscountPercent(ProductVariant variant) {
        if (variant == null) return 0;
        Integer baseDiscount = variant.getDiscountPercent() != null ? variant.getDiscountPercent() : 0;
        
        Product product = variant.getProduct();
        Long brandId = (product != null && product.getBrand() != null) ? product.getBrand().getId() : null;
        
        List<CampaignDto> activeCampaigns = campaignService.getActiveCampaigns();
        
        // Find max extra discount applicable
        int maxExtraDiscount = 0;
        if (activeCampaigns != null) {
            for (CampaignDto camp : activeCampaigns) {
                if (camp.getBrandId() == null || camp.getBrandId().equals(brandId)) {
                    if (camp.getExtraDiscountPercent() != null && camp.getExtraDiscountPercent() > maxExtraDiscount) {
                        maxExtraDiscount = camp.getExtraDiscountPercent();
                    }
                }
            }
        }
        
        int totalDiscount = baseDiscount + maxExtraDiscount;
        return totalDiscount > 100 ? 100 : totalDiscount;
    }
}
