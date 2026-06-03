package com.simback.perfume.service;

import com.simback.perfume.payload.requests.CancelUserRequest;
import com.simback.perfume.payload.requests.UpdateProfileRequest;
import com.simback.perfume.payload.responses.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getCurrentUser(String username);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long userId);
    UserResponse updateMyProfile(String username, UpdateProfileRequest request);
    UserResponse toggleUserStatus(Long userId, String adminUsername);
    UserResponse cancelMyAccount(String username, CancelUserRequest request);
}
