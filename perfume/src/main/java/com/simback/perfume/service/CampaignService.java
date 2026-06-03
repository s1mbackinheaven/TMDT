package com.simback.perfume.service;

import com.simback.perfume.payload.requests.CampaignRequest;
import com.simback.perfume.payload.responses.CampaignDto;

import java.util.List;

public interface CampaignService {
    List<CampaignDto> getAllCampaigns();
    List<CampaignDto> getActiveCampaigns();
    CampaignDto createCampaign(CampaignRequest request);
    CampaignDto updateCampaign(Long id, CampaignRequest request);
    void deleteCampaign(Long id);
    CampaignDto getCampaignById(Long id);
}
