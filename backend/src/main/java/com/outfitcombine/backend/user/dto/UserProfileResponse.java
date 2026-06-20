package com.outfitcombine.backend.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String keycloakUserId,
        String email,
        String username,
        String displayName,
        String profileImageUrl,
        String bio,
        String gender,
        String[] stylePreferences,
        boolean isPrivate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
