package com.simback.perfume.controller;

import com.simback.perfume.payload.responses.UploadResponse;
import com.simback.perfume.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {
    private final MediaService mediaService;

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> uploadImage(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(mediaService.uploadImage(file));
    }

    @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<UploadResponse>> uploadImages(@RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.ok(mediaService.uploadImages(files));
    }
}
