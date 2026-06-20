package com.outfitcombine.backend.upload;

import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.storage.PresignedUploadResult;
import com.outfitcombine.backend.storage.StorageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/upload")
public class UploadController {

    private static final List<String> ALLOWED_FOLDERS = List.of("clothing", "profiles", "posts");
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/presigned")
    public ResponseEntity<ApiResponse<UploadResponse>> presigned(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UploadRequest request) {

        if (!ALLOWED_FOLDERS.contains(request.folder())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid folder. Allowed: " + ALLOWED_FOLDERS));
        }

        if (!ALLOWED_CONTENT_TYPES.contains(request.contentType())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid content type. Allowed: " + ALLOWED_CONTENT_TYPES));
        }

        String userId = jwt.getSubject();
        PresignedUploadResult result = storageService.generatePresignedUploadUrl(
                request.folder(), userId, request.contentType());

        UploadResponse response = new UploadResponse(
                result.presignedUrl(), result.publicUrl(), result.objectName());

        return ResponseEntity.ok(ApiResponse.success("Presigned URL generated", response));
    }
}
