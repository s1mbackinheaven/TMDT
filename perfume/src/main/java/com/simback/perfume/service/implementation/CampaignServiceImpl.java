package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.Brand;
import com.simback.perfume.model.Campaign;
import com.simback.perfume.payload.requests.CampaignRequest;
import com.simback.perfume.payload.responses.CampaignDto;
import com.simback.perfume.repository.BrandRepository;
import com.simback.perfume.repository.CampaignRepository;
import com.simback.perfume.service.CampaignService;
import com.simback.perfume.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignServiceImpl implements CampaignService {
    private final CampaignRepository campaignRepository;
    private final BrandRepository brandRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<CampaignDto> getAllCampaigns() {
        return campaignRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "activeCampaigns")
    public List<CampaignDto> getActiveCampaigns() {
        return campaignRepository.findByIsActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeCampaigns", allEntries = true)
    public CampaignDto createCampaign(CampaignRequest request) {
        Campaign campaign = new Campaign();
        mapToEntity(request, campaign);
        Campaign saved = campaignRepository.save(campaign);
        
        if (saved.getIsActive()) {
            sendCampaignNotification(saved);
        }
        
        return toDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeCampaigns", allEntries = true)
    public CampaignDto updateCampaign(Long id, CampaignRequest request) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
        
        boolean wasActive = campaign.getIsActive() != null && campaign.getIsActive();
        mapToEntity(request, campaign);
        Campaign saved = campaignRepository.save(campaign);
        
        if (!wasActive && saved.getIsActive()) {
            sendCampaignNotification(saved);
        }
        
        return toDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "activeCampaigns", allEntries = true)
    public void deleteCampaign(Long id) {
        if (!campaignRepository.existsById(id)) {
            throw new ResourceNotFoundException("Campaign not found with id: " + id);
        }
        campaignRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaignDto getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
    }

    private void mapToEntity(CampaignRequest req, Campaign c) {
        c.setTitle(req.getTitle());
        c.setDescription(req.getDescription());
        c.setBannerUrl(req.getBannerUrl());
        c.setBrandId(req.getBrandId());
        c.setExtraDiscountPercent(req.getExtraDiscountPercent());
        c.setIsActive(req.getIsActive() != null ? req.getIsActive() : false);
        
        // Validate brandId if present
        if (req.getBrandId() != null) {
            if (!brandRepository.existsById(req.getBrandId())) {
                throw new ResourceNotFoundException("Brand not found with id: " + req.getBrandId());
            }
        }
    }

    private CampaignDto toDto(Campaign c) {
        String brandName = null;
        if (c.getBrandId() != null) {
            brandName = brandRepository.findById(c.getBrandId()).map(Brand::getName).orElse(null);
        }
        return CampaignDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .bannerUrl(c.getBannerUrl())
                .brandId(c.getBrandId())
                .brandName(brandName)
                .extraDiscountPercent(c.getExtraDiscountPercent())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private void sendCampaignNotification(Campaign campaign) {
        String msg = "Khuyến mãi mới: " + campaign.getTitle() + 
                     " (Giảm " + campaign.getExtraDiscountPercent() + "%)";
                     
        notificationService.broadcast(
                "Khuyến mãi đặc biệt!",
                msg,
                "/products",
                campaign.getBannerUrl() != null ? campaign.getBannerUrl() : "https://lanperfume.com/wp-content/uploads/2024/10/dia-chj-ban-nuoc-hoa-chinh-hang-lan-perfume.jpg",
                "SYSTEM"
        );
    }
}
