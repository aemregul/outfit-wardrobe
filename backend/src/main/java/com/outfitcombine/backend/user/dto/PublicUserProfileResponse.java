package com.outfitcombine.backend.user.dto;

import java.util.UUID;

public record PublicUserProfileResponse(
        UUID id,
        String username,
        String displayName,
        String bio,
        String profileImageUrl,
        long followerCount,
        long followingCount,
        boolean isFollowing,
        boolean isPrivate
) {}
