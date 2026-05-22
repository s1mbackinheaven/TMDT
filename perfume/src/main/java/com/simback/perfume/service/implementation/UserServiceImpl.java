package com.simback.perfume.service.implementation;

import com.simback.perfume.exception.ResourceNotFoundException;
import com.simback.perfume.model.Role;
import com.simback.perfume.model.User;
import com.simback.perfume.model.UserStatus;
import com.simback.perfume.payload.requests.CancelUserRequest;
import com.simback.perfume.payload.requests.UpdateProfileRequest;
import com.simback.perfume.payload.responses.UserResponse;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        return toResponse(resolveActiveUser(username));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        return toResponse(getUser(userId));
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(String username, UpdateProfileRequest request) {
        User user = resolveActiveUser(username);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim().toLowerCase());
        }
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setProfilePicture(request.getProfilePicture());
        userRepository.save(user);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse cancelUser(Long userId, String adminUsername, CancelUserRequest request) {
        ensureAdmin(adminUsername);
        User user = getUser(userId);
        user.setStatus(UserStatus.CANCELLED);
        userRepository.save(user);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse cancelMyAccount(String username, CancelUserRequest request) {
        User user = resolveActiveUser(username);
        user.setStatus(UserStatus.CANCELLED);
        userRepository.save(user);
        return toResponse(user);
    }

    private User resolveActiveUser(String username) {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
        if (user.getStatus() == UserStatus.CANCELLED) {
            throw new IllegalArgumentException("Tài khoản đã bị hủy");
        }
        return user;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user id: " + userId));
    }

    private void ensureAdmin(String username) {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác với user");
        }
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .gender(user.getGender())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .profilePicture(user.getProfilePicture())
                .isVerified(user.getIsVerified())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
