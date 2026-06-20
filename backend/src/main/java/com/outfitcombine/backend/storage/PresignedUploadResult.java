package com.outfitcombine.backend.storage;

public record PresignedUploadResult(String presignedUrl, String publicUrl, String objectName) {}
