package com.simback.perfume.controller;

import com.simback.perfume.configuration.PayosConfiguration;
import com.simback.perfume.payload.requests.CheckoutCreateRequest;
import com.simback.perfume.payload.responses.PayosCheckoutResponse;
import com.simback.perfume.payload.responses.PayosWebhookResponse;
import com.simback.perfume.service.PayosCheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.payos.PayOS;
import vn.payos.model.webhooks.Webhook;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {
    private final PayosCheckoutService payosCheckoutService;
    private final PayOS payOS;
    private final PayosConfiguration payosConfiguration;

    @PostMapping("/payos")
    public ResponseEntity<PayosCheckoutResponse> createCheckout(@Valid @RequestBody CheckoutCreateRequest request,
                                                                HttpServletRequest servletRequest) {
        return ResponseEntity.ok(payosCheckoutService.createCheckout(resolveGuestKey(servletRequest), resolveUsername(), request));
    }

    @GetMapping("/payos/return")
    public void payosReturn(HttpServletResponse response) throws IOException {
        response.sendRedirect("https://perfume.culus.io.vn/?payment=success");
    }

    @GetMapping("/payos/cancel")
    public void payosCancel(@RequestParam(required = false) Long orderCode, HttpServletResponse response) throws IOException {
        if (orderCode != null) {
            try {
                payosCheckoutService.cancelOrder(orderCode);
                log.info("Canceled order {} due to PayOS payment cancellation", orderCode);
            } catch (Exception e) {
                log.error("Failed to cancel order {}", orderCode, e);
            }
        }
        response.sendRedirect("https://perfume.culus.io.vn/?payment=cancel");
    }

    @PostMapping("/payos/webhook")
    public ResponseEntity<PayosWebhookResponse> payosWebhook(HttpServletRequest servletRequest) {
        log.info("===== PAYOS WEBHOOK RECEIVED =====");
        log.info("Remote IP: {}", servletRequest.getRemoteAddr());
        log.info("X-Forwarded-For: {}", servletRequest.getHeader("X-Forwarded-For"));
        log.info("Content-Type: {}", servletRequest.getContentType());
        
        try {
            // Đọc raw payload để tránh lỗi 400 Bad Request của Spring
            String payload = servletRequest.getReader().lines().collect(java.util.stream.Collectors.joining(System.lineSeparator()));
            log.info("Raw Payload: {}", payload);
            
            // Tự parse sang Webhook class
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Webhook webhook = mapper.readValue(payload, Webhook.class);
            
            return ResponseEntity.ok(payosCheckoutService.handleWebhook(webhook));
        } catch (Exception e) {
            log.error("Webhook processing failed, but returning 200 OK to PayOS", e);
            return ResponseEntity.ok(PayosWebhookResponse.builder()
                    .message("Webhook received but processing failed: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Gọi endpoint này SAU KHI DEPLOY lên production để đăng ký webhook URL với PayOS.
     * PayOS sẽ gọi thử đến webhook URL để xác nhận, nên server phải đang chạy trên production.
     * Chỉ cần gọi 1 lần.
     */
    @GetMapping("/payos/confirm-webhook")
    public ResponseEntity<Map<String, String>> confirmWebhook() {
        try {
            var result = payOS.webhooks().confirm(payosConfiguration.getWebhookUrl());
            log.info("✅ Webhook confirmed: {}", result);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "webhookUrl", payosConfiguration.getWebhookUrl(),
                    "message", "Webhook URL đã được đăng ký với PayOS"
            ));
        } catch (Exception e) {
            log.error("❌ Confirm webhook failed", e);
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "webhookUrl", payosConfiguration.getWebhookUrl(),
                    "error", e.getMessage()
            ));
        }
    }

    private String resolveGuestKey(HttpServletRequest request) {
        return request.getHeader("X-Guest-Key");
    }

    private String resolveUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return null;
        }
        String name = authentication.getName();
        return "anonymousUser".equalsIgnoreCase(name) ? null : name;
    }
}
