package com.outfitcombine.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Username can only contain letters, numbers, underscores, dots and hyphens")
        String username,

        @Size(max = 255, message = "Display name too long")
        String displayName,

        @Size(max = 500, message = "Bio too long")
        String bio,

        String profileImageUrl,

        String gender,

        String[] stylePreferences,

        boolean isPrivate
) {}
