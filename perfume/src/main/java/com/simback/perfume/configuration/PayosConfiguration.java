package com.simback.perfume.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
@Slf4j
public class PayosConfiguration {

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.webhook-url:https://api.culus.io.vn/api/v1/checkout/payos/webhook}")
    private String webhookUrl;

    @Bean
    public PayOS payOS() {
        return new PayOS(clientId, apiKey, checksumKey);
    }

    /**
     * Gọi method này để đăng ký webhook URL với PayOS.
     * Chỉ gọi khi app đang chạy trên production (api.culus.io.vn).
     */
    public void confirmWebhookManually(PayOS payOS) {
        try {
            var result = payOS.webhooks().confirm(webhookUrl);
            log.info("✅ PayOS webhook confirmed: URL={}, result={}", webhookUrl, result);
        } catch (Exception e) {
            log.error("❌ Failed to confirm PayOS webhook URL: {}", webhookUrl, e);
        }
    }

    public String getWebhookUrl() {
        return webhookUrl;
    }
}
