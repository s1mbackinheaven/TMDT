package com.simback.perfume.service;

import com.simback.perfume.payload.requests.*;
import com.simback.perfume.payload.responses.*;
import org.springframework.http.ResponseEntity;

public interface AuthenticationService {
    ResponseEntity<RegisterResponse> registerUser(RegisterRequest registerRequest);

    ResponseEntity<?> verifyUserRegistration(RegisterVerifyRequest registerVerifyRequest);

    ResponseEntity<?> loginUser(LoginRequest loginRequest);

    ResponseEntity<?> resendOtp(ForgotPasswordRequest forgotPasswordRequest);

    ResponseEntity<?> verifyOtp(RegisterVerifyRequest registerVerifyRequest);

    ResponseEntity<?> resetPassword(ResetPasswordRequest resetPasswordRequest);

    ResponseEntity<?> myProfile(ForgotPasswordRequest forgotPasswordRequest);
}
