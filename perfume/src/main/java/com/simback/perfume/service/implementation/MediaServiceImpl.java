package com.simback.perfume.service.implementation;

import com.simback.perfume.payload.responses.UploadResponse;
import com.simback.perfume.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:https://api.culus.io.vn}")
    private String baseUrl;

    @Override
    public UploadResponse uploadImage(MultipartFile file) {
        validateImage(file);
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String extension = getExtension(originalName);
            String fileName = UUID.randomUUID() + extension;
            Path target = dir.resolve(fileName);
            Files.copy(file.getInputStream(), target);

            return UploadResponse.builder()
                    .fileName(fileName)
                    .originalName(originalName)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .url(baseUrl + "/uploads/" + fileName)
                    .build();
        } catch (IOException e) {
            throw new IllegalArgumentException("Không thể upload ảnh: " + e.getMessage());
        }
    }

    @Override
    public List<UploadResponse> uploadImages(List<MultipartFile> files) {
        List<UploadResponse> results = new ArrayList<>();
        for (MultipartFile file : files) {
            results.add(uploadImage(file));
        }
        return results;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File ảnh không được rỗng");
        }
    }

    private String getExtension(String fileName) {
        int idx = fileName.lastIndexOf('.');
        return idx >= 0 ? fileName.substring(idx) : "";
    }
}
