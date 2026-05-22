package com.simback.perfume.service;

import com.simback.perfume.payload.requests.CheckoutPrepareRequest;
import com.simback.perfume.payload.responses.CheckoutBillResponse;
import com.simback.perfume.payload.responses.CheckoutConfirmResponse;

public interface CheckoutService {
    CheckoutBillResponse prepareCheckout(String guestKey, String username, CheckoutPrepareRequest request);
    CheckoutConfirmResponse confirmCheckout(String draftNumber, String username);
}
