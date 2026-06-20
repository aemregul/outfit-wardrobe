package com.outfitcombine.backend.storage;

public interface StorageService {

    PresignedUploadResult generatePresignedUploadUrl(String folder, String userId, String contentType);
}
