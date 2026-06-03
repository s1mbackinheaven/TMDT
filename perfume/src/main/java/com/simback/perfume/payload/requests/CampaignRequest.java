package com.simback.perfume.payload.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CampaignRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private String bannerUrl;
    private Long brandId;
    
    @NotNull(message = "Extra discount percent is required")
    private Integer extraDiscountPercent;
    
    private Boolean isActive;
}
