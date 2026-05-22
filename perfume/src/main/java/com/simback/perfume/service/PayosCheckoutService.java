package com.simback.perfume.service;

import com.simback.perfume.payload.requests.CheckoutCreateRequest;
import com.simback.perfume.payload.responses.PayosCheckoutResponse;
import com.simback.perfume.payload.responses.PayosWebhookResponse;

public interface PayosCheckoutService {
    PayosCheckoutResponse createCheckout(String guestKey, String username, CheckoutCreateRequest request);
    PayosWebhookResponse handleWebhook(Object webhook);
}
