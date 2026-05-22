package com.simback.perfume.service.implementation;

import com.simback.perfume.contants.ApplicationConstants;
import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.Role;
import com.simback.perfume.model.User;
import com.simback.perfume.payload.responses.*;
import com.simback.perfume.payload.requests.*;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.AuthenticationService;
import com.simback.perfume.service.EmailService;
import com.simback.perfume.service.JwtService;
import com.simback.perfume.service.OtpService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceIplm implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final CacheManager cacheManager;
    private final AuthenticationManager authenticationManager;

    @Override
    public ResponseEntity<RegisterResponse> registerUser(RegisterRequest registerRequest) {
        try {
            String normalizedEmail = normalizeEmail(registerRequest.getEmail());
            String normalizedUsername = normalizeUsername(registerRequest.getUsername());
            String normalizedPhoneNumber = normalizePhoneNumber(registerRequest.getPhoneNumber());

            log.info("Received request to register user with email {}", normalizedEmail);
            Optional<User> existingUserOpt = userRepository.findByEmail(normalizedEmail);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                log.info("User already exists with email {}", normalizedEmail);
                if (Boolean.TRUE.equals(existingUser.getIsVerified())) {
                    return new ResponseEntity<>(RegisterResponse.builder()
                            .message("User already exists with this email. Please try again with a different email.")
                            .build(), HttpStatus.BAD_REQUEST);
                } else {
                    log.info("User already exists but not verified with email {}, so their details will be updated", normalizedEmail);
                    if (isUsernameTakenByAnotherUser(normalizedUsername, existingUser.getId())) {
                        return new ResponseEntity<>(RegisterResponse.builder()
                                .message("User already exists with this username. Please try again with a different username.")
                                .build(), HttpStatus.BAD_REQUEST);
                    }
                    if (isPhoneTakenByAnotherUser(normalizedPhoneNumber, existingUser.getId())) {
                        return new ResponseEntity<>(RegisterResponse.builder()
                                .message("User already exists with this phone number. Please try again with a different phone number.")
                                .build(), HttpStatus.BAD_REQUEST);
                    }
                    updateUserDetails(existingUser, registerRequest);
                    String otpToBeMailed = otpService.getOtpForEmail(normalizedEmail);
                    CompletableFuture<Integer> emailResponse = emailService.sendEmailWithRetry(normalizedEmail, otpToBeMailed);
                    if (emailResponse.get() == -1) {
                        return new ResponseEntity<>(RegisterResponse.builder()
                                .message("Failed to send OTP email. Please try again later.")
                                .build(), HttpStatus.INTERNAL_SERVER_ERROR);
                    }
                    userRepository.save(existingUser);
                    return new ResponseEntity<>(RegisterResponse.builder()
                            .message("An email with OTP has been sent to your email address. Kindly verify.")
                            .build(), HttpStatus.CREATED);
                }
            }

            if (userRepository.findByUsername(normalizedUsername).isPresent()) {
                log.info("User already exists with username {}", normalizedUsername);
                return new ResponseEntity<>(RegisterResponse.builder()
                        .message("User already exists with this username. Please try again with a different username.")
                        .build(), HttpStatus.BAD_REQUEST);
            }

            if (normalizedPhoneNumber != null && userRepository.findByPhoneNumber(normalizedPhoneNumber).isPresent()) {
                log.info("User already exists with phone number {}", normalizedPhoneNumber);
                return new ResponseEntity<>(RegisterResponse.builder()
                        .message("User already exists with this phone number. Please try again with a different phone number.")
                        .build(), HttpStatus.BAD_REQUEST);
            }

            log.info("User does not exist with email {}, so this user will be created", normalizedEmail);
            User newUser = createUser(registerRequest);
            String otpToBeMailed = otpService.getOtpForEmail(normalizedEmail);
            CompletableFuture<Integer> emailResponse = emailService.sendEmailWithRetry(normalizedEmail, otpToBeMailed);
            if (emailResponse.get() == -1) {
                return new ResponseEntity<>(RegisterResponse.builder()
                        .message("Failed to send OTP email. Please try again later.")
                        .build(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            userRepository.save(newUser);
            log.info("User saved with the email {}", normalizedEmail);
            return new ResponseEntity<>(RegisterResponse.builder()
                    .message("An email with OTP has been sent to your email address. Kindly verify.")
                    .build(), HttpStatus.CREATED);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send OTP email for user with email {}", registerRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(RegisterResponse.builder()
                    .message("Failed to send OTP email. Please try again later.")
                    .build());
        } catch (DataIntegrityViolationException ex) {
            log.error("Failed to register user with email {} due to duplicate database constraint", registerRequest.getEmail(), ex);
            if (isPhoneNumberConstraintViolation(ex)) {
                return new ResponseEntity<>(RegisterResponse.builder()
                        .message("User already exists with this phone number. Please try again with a different phone number.")
                        .build(), HttpStatus.BAD_REQUEST);
            }
            if (isUsernameConstraintViolation(ex)) {
                return new ResponseEntity<>(RegisterResponse.builder()
                        .message("User already exists with this username. Please try again with a different username.")
                        .build(), HttpStatus.BAD_REQUEST);
            }
            if (isEmailConstraintViolation(ex)) {
                return new ResponseEntity<>(RegisterResponse.builder()
                        .message("User already exists with this email. Please try again with a different email.")
                        .build(), HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(RegisterResponse.builder()
                    .message("User already exists. Please check your input and try again.")
                    .build(), HttpStatus.BAD_REQUEST);
        }
        catch (Exception e) {
            log.error("Failed to register user with email {}", registerRequest.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(RegisterResponse.builder()
                    .message("Failed to register user. Please try again later.")
                    .build());
        }
    }

    private void updateUserDetails(User user, RegisterRequest registerRequest) {
        applyUserFields(registerRequest, user);
    }

    private User createUser(RegisterRequest registerRequest) {
        User user = new User();
        applyUserFields(registerRequest, user);
        return user;
    }

    private void applyUserFields(RegisterRequest registerRequest, User user) {
        String normalizedEmail = normalizeEmail(registerRequest.getEmail());
        String normalizedUsername = normalizeUsername(registerRequest.getUsername());
        String normalizedPhoneNumber = normalizePhoneNumber(registerRequest.getPhoneNumber());

        if (registerRequest.getGender().equals("FEMALE")) {
            user.setProfilePicture(ApplicationConstants.femaleProfilePicture);
        } else {
            user.setProfilePicture(ApplicationConstants.maleProfilePicture);
        }
        user.setUsername(normalizedUsername);
        user.setFirstName(registerRequest.getFirstName().trim());
        user.setLastName(registerRequest.getLastName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setGender(registerRequest.getGender());
        user.setPhoneNumber(normalizedPhoneNumber);
        user.setAddress(registerRequest.getAddress());
        user.setIsVerified(false);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeUsername(String username) {
        return username == null ? null : username.trim().toLowerCase();
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null ? null : phoneNumber.trim();
    }

    private boolean isPhoneNumberConstraintViolation(DataIntegrityViolationException ex) {
        return hasConstraintMention(ex, "phone") || hasConstraintMention(ex, "phone_number");
    }

    private boolean isUsernameConstraintViolation(DataIntegrityViolationException ex) {
        return hasConstraintMention(ex, "username") && !isPhoneNumberConstraintViolation(ex);
    }

    private boolean isEmailConstraintViolation(DataIntegrityViolationException ex) {
        return hasConstraintMention(ex, "email");
    }

    private boolean isUsernameTakenByAnotherUser(String username, Long currentUserId) {
        return userRepository.findByUsername(username)
                .filter(user -> !user.getId().equals(currentUserId))
                .isPresent();
    }

    private boolean isPhoneTakenByAnotherUser(String phoneNumber, Long currentUserId) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return false;
        }
        return userRepository.findByPhoneNumber(phoneNumber)
                .filter(user -> !user.getId().equals(currentUserId))
                .isPresent();
    }

    private boolean hasConstraintMention(Throwable throwable, String keyword) {
        Throwable current = throwable;
        while (current != null) {
            String message = current.getMessage();
            if (message != null && message.toLowerCase().contains(keyword.toLowerCase())) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    @Override
    public ResponseEntity<?> verifyUserRegistration(RegisterVerifyRequest registerVerifyRequest) {
        String emailEntered = registerVerifyRequest.getEmail().trim().toLowerCase();
        String otpEntered = registerVerifyRequest.getOtp().trim();
        try {
            User user = userRepository.findByEmail(emailEntered).orElseThrow(
                    ResourceNotFoundException::new
            );
            String cachedOtp = cacheManager.getCache("user").get(emailEntered, String.class);
            if (cachedOtp == null) {
                log.info("the otp is not present in cache memory, it has expired for user {}, kindly retry and Register", emailEntered);
                return new ResponseEntity<>(GeneralAPIResponse.builder().message("Otp has been expired for user " + emailEntered).build(), HttpStatus.REQUEST_TIMEOUT);
            } else if (!otpEntered.equals(cachedOtp)) {
                log.info("the entered otp does not match the otp Stored in cache for email {}", emailEntered);
                return new ResponseEntity<>(GeneralAPIResponse.builder().message("Incorrect otp has been entered").build(), HttpStatus.BAD_REQUEST);
            } else {
                user.setIsVerified(true);
                userRepository.save(user);
                log.info("the user email {} is successfully verified", user.isEnabled());
                RegisterVerifyResponse jwtToken = jwtService.generateJwtToken(user);
                return new ResponseEntity<>(jwtToken, HttpStatus.CREATED);

            }
        } catch (ResourceNotFoundException ex) {
            log.info("user with email {} not found in database", emailEntered);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("user with this email does not exist").build(), HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity<?> loginUser(LoginRequest loginRequest) {
        String username = loginRequest.getUsername().trim().toLowerCase();
        String password = loginRequest.getPassword();
        try {
            User user = userRepository.findByUsername(username).orElseThrow(
                    ResourceNotFoundException::new
            );
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
            if (!user.getIsVerified()) {
                return new ResponseEntity<>(GeneralAPIResponse.builder().message("User is not verified").build(), HttpStatus.BAD_REQUEST);
            }

            RegisterVerifyResponse jwtToken = jwtService.generateJwtToken(user);
            return new ResponseEntity<>(jwtToken, HttpStatus.OK);

        } catch (ResourceNotFoundException ex) {
            log.info("user whose username is {} not found in Database", username);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("User with this email does not exist").build(), HttpStatus.NOT_FOUND);
        }
        catch (Exception e) {
            log.error("Failed to authenticate user with username {}", username, e);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("Invalid credentials").build(), HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ResponseEntity<?> resendOtp(ForgotPasswordRequest forgotPasswordRequest) {
        String email = forgotPasswordRequest.getEmail().trim().toLowerCase();
        try {
            User user = userRepository.findByEmail(email).orElseThrow(
                    ResourceNotFoundException::new
            );
            if (cacheManager.getCache("user").get(email, String.class) != null) {
                log.info("the otp is already present in cache memory for user {}, kindly retry after some time", email);
                return new ResponseEntity<>(GeneralAPIResponse.builder().message("Kindly retry after 1 minute").build(), HttpStatus.TOO_MANY_REQUESTS);
            }
            String otpToBeSend = otpService.getOtpForEmail(email);
            CompletableFuture<Integer> emailResponse= emailService.sendEmailWithRetry(email,otpToBeSend);
            if (emailResponse.get() == -1) {
                return new ResponseEntity<>(GeneralAPIResponse.builder().message("Failed to send OTP email. Please try again later.").build(), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return  new ResponseEntity<>(GeneralAPIResponse.builder().message("An email with OTP has been sent to your email address. Kindly verify.").build(), HttpStatus.OK);

        } catch ( UnsupportedEncodingException e) {
            log.error("Failed to send OTP email for user with email {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(RegisterResponse.builder()
                    .message("Failed to send OTP email. Please try again later.")
                    .build());
        } catch (ResourceNotFoundException ex) {
            log.info("user with email {} not found in Database", email);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("User with email not found in database").build(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Failed to resend OTP for user with email {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(RegisterResponse.builder()
                    .message("Failed to resend OTP. Please try again later.")
                    .build());
        }
    }

    @Override
    public ResponseEntity<?> verifyOtp(RegisterVerifyRequest registerVerifyRequest) {
        String email = registerVerifyRequest.getEmail().trim().toLowerCase();
        String otp = registerVerifyRequest.getOtp().trim();
        try {
            User user = userRepository.findByEmail(email).orElseThrow(
                    ResourceNotFoundException::new
            );
        } catch (ResourceNotFoundException ex) {
            log.info("user with email {} not found in database ", email);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("iUser with this email does not exist").build(), HttpStatus.NOT_FOUND);
        }
        String cachedOtp = cacheManager.getCache("user").get(email, String.class);
        if (cachedOtp == null) {
            log.info("the otp is not present in cache memory, it has expired for user {}, kindly retry", email);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("Otp has been expired for user " + email).build(), HttpStatus.REQUEST_TIMEOUT);
        } else if (!otp.equals(cachedOtp)) {
            log.info("entered otp does not match the otp Stored in cache for email {}", email);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("Incorrect otp has been entered").build(), HttpStatus.BAD_REQUEST);
        } else {
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("otp verified successfully, now you can change the password").build(), HttpStatus.OK);
        }
    }

    @Override
    public ResponseEntity<?> resetPassword(ResetPasswordRequest resetPasswordRequest) {
        String username = resetPasswordRequest.getUsername().trim().toLowerCase();
        String newPassword = resetPasswordRequest.getPassword();
        String confirmPassword = resetPasswordRequest.getConfirmPassword();

        if (!newPassword.equals(confirmPassword)) {
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("Password and confirm password do not match").build(), HttpStatus.BAD_REQUEST);
        }
        try {
            User user = userRepository.findByUsername(username).orElseThrow(
                    ResourceNotFoundException::new
            );
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("Password has been reset successfully").build(), HttpStatus.OK);
        } catch (ResourceNotFoundException ex) {
            log.info("user with username {} not found in the database", username);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("user does not exist with this username").build(), HttpStatus.NOT_FOUND);
        }
    }

    @Override
    public ResponseEntity<?> myProfile(ForgotPasswordRequest forgotPasswordRequest) {
        String email = forgotPasswordRequest.getEmail().trim().toLowerCase();
        try {
            User user = userRepository.findByEmail(email).orElseThrow(
                    ResourceNotFoundException::new
            );
            return new ResponseEntity<>(UserProfile.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .phoneNumber(user.getPhoneNumber())
                    .gender(user.getGender())
                    .address(user.getAddress())
                    .role(user.getRole())
                    .profilePicture(user.getProfilePicture())
                    .isOfficiallyEnabled(user.getIsVerified())
                    .build(), HttpStatus.OK);

        } catch (ResourceNotFoundException ex) {
            log.info("user with email {} not found in the Database", email);
            return new ResponseEntity<>(GeneralAPIResponse.builder().message("user does not exist with this email").build(), HttpStatus.NOT_FOUND);
        }
    }
}
