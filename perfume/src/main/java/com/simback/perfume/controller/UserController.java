package com.simback.perfume.controller;

import com.simback.perfume.payload.requests.CancelUserRequest;
import com.simback.perfume.payload.requests.UpdateProfileRequest;
import com.simback.perfume.payload.responses.UserResponse;
import com.simback.perfume.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(userService.getCurrentUser(resolveUsername()));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(resolveUsername(), request));
    }

    @PatchMapping("/{userId}/cancel")
    public ResponseEntity<UserResponse> cancelUser(@PathVariable Long userId,
                                                   @Valid @RequestBody CancelUserRequest request) {
        return ResponseEntity.ok(userService.cancelUser(userId, resolveUsername(), request));
    }

    @PatchMapping("/me/cancel")
    public ResponseEntity<UserResponse> cancelMyAccount(@Valid @RequestBody CancelUserRequest request) {
        return ResponseEntity.ok(userService.cancelMyAccount(resolveUsername(), request));
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
