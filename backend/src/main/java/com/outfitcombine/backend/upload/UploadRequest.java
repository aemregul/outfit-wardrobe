package com.outfitcombine.backend.upload;

import jakarta.validation.constraints.NotBlank;

public record UploadRequest(
        @NotBlank String folder,
        @NotBlank String contentType
) {}
