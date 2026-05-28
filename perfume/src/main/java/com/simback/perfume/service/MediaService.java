package com.simback.perfume.service;

import com.simback.perfume.payload.responses.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {
    UploadResponse uploadImage(MultipartFile file);
    List<UploadResponse> uploadImages(List<MultipartFile> files);
}
