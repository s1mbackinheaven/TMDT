package com.simback.perfume.payload.responses;

import com.simback.perfume.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterVerifyResponse {
    private String accessToken;
    private String refreshToken;
    private String fullName;
    private String email;
    private Role role;
    private boolean isVerified;
}
