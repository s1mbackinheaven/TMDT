package com.simback.perfume.payload.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadResponse {
    private String fileName;
    private String originalName;
    private String contentType;
    private long size;
    private String url;
}
