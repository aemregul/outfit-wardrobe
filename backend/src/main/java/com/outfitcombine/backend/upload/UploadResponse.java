package com.outfitcombine.backend.upload;

public record UploadResponse(String presignedUrl, String publicUrl, String objectName) {}
