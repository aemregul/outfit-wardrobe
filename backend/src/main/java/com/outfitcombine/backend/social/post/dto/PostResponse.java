package com.outfitcombine.backend.social.post.dto;

import com.outfitcombine.backend.social.enums.Visibility;

import java.time.LocalDateTime;
import java.util.UUID;

public record PostResponse(
        UUID id,
        UUID userId,
        String username,
        String displayName,
        UUID outfitId,
        String imageUrl,
        String caption,
        Visibility visibility,
        int likesCount,
        int commentsCount,
        boolean likedByCurrentUser,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
