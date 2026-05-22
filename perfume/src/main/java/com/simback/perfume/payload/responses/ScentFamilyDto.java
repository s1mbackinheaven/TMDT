package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO nhóm hương (dropdown / nested trong Product). */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScentFamilyDto {
    private Long id;
    private String name;
    private String slug;
}
