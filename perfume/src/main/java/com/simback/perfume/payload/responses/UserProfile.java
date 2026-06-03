package com.simback.perfume.payload.responses;

import com.simback.perfume.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String gender;
    private Role role;
    private String address;
    private String profilePicture;
    private Boolean isOfficiallyEnabled;
    private Integer loyaltyPoints;
    private String loyaltyTier;
}
