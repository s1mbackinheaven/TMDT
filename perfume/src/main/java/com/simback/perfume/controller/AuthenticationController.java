package com.simback.perfume.controller;

import com.simback.perfume.payload.requests.*;
import com.simback.perfume.payload.responses.*;
import com.simback.perfume.service.AuthenticationService;
import com.simback.perfume.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController{

    private final AuthenticationService authenticationService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Register request received for email: {}", registerRequest.getEmail());
        return authenticationService.registerUser(registerRequest);
    }

    @PostMapping(value = "/verify-registration" , consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verifyRegistration(@Valid @RequestBody RegisterVerifyRequest registerVerifyRequest) {
        log.info("registration verification request received for email {}", registerVerifyRequest.getEmail());
        return authenticationService.verifyUserRegistration(registerVerifyRequest);
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("login request received for username {}", loginRequest.getUsername());
        ResponseEntity<?> response = authenticationService.loginUser(loginRequest);
        return response;
    }

    @PostMapping(value = "/send-otp", consumes = MediaType.APPLICATION_JSON_VALUE,produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        log.info("forgot password request received for email {}", forgotPasswordRequest.getEmail());
        return authenticationService.resendOtp(forgotPasswordRequest);
    }

    @PostMapping(value = "/verify-otp", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody RegisterVerifyRequest registerVerifyRequest) {
        log.info("OTP verification request received for email {}", registerVerifyRequest.getEmail());
        return authenticationService.verifyOtp(registerVerifyRequest);
    }

    @PostMapping(value = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        log.info("Password reset request received for username {}", resetPasswordRequest.getUsername());
        return authenticationService.resetPassword(resetPasswordRequest);
    }


    @GetMapping("/getRefreshToken")
    public ResponseEntity<?> refreshToken(@RequestParam(name = "refreshToken") String refreshToken) {
        log.info("Refresh token request received");
        return jwtService.generateAccessTokenFromRefreshToken(refreshToken);
    }

    @PostMapping("/hello")
    public ResponseEntity<?> hello() {
        log.info("Hello request received");
        return new ResponseEntity<>(GeneralAPIResponse.builder().message("This Api is automated, for doing cronJob so that render does not get turned off").build(), HttpStatus.OK);
    }

}
