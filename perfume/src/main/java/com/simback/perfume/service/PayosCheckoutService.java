package com.simback.perfume.service;

import com.simback.perfume.payload.requests.CheckoutCreateRequest;
import com.simback.perfume.payload.responses.PayosCheckoutResponse;
import com.simback.perfume.payload.responses.PayosWebhookResponse;
import vn.payos.model.webhooks.Webhook;

public interface PayosCheckoutService {
    void cancelOrder(Long orderId);
    PayosCheckoutResponse createCheckout(String guestKey, String username, CheckoutCreateRequest request);
    PayosWebhookResponse handleWebhook(Webhook webhook);
}

