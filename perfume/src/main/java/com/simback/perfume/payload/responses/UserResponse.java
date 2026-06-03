package com.simback.perfume.payload.responses;

import com.simback.perfume.model.Role;
import com.simback.perfume.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String gender;
    private String phoneNumber;
    private String address;
    private String profilePicture;
    private Boolean isVerified;
    private Integer loyaltyPoints;
    private String loyaltyTier;
    private Role role;
    private UserStatus status;
}
