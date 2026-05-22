package com.simback.perfume.controller;

import com.simback.perfume.payload.requests.CheckoutCreateRequest;
import com.simback.perfume.payload.responses.PayosCheckoutResponse;
import com.simback.perfume.payload.responses.PayosWebhookResponse;
import com.simback.perfume.service.PayosCheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final PayosCheckoutService payosCheckoutService;

    @PostMapping("/payos")
    public ResponseEntity<PayosCheckoutResponse> createCheckout(@Valid @RequestBody CheckoutCreateRequest request,
                                                                HttpServletRequest servletRequest) {
        return ResponseEntity.ok(payosCheckoutService.createCheckout(resolveGuestKey(servletRequest), resolveUsername(), request));
    }

    @PostMapping("/payos/webhook")
    public ResponseEntity<PayosWebhookResponse> payosWebhook(@RequestBody Object webhook) {
        return ResponseEntity.ok(payosCheckoutService.handleWebhook(webhook));
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
