package com.outfitcombine.backend.social.post.dto;

import com.outfitcombine.backend.social.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PostRequest(
        @NotBlank(message = "Image URL is required")
        String imageUrl,

        @Size(max = 2000, message = "Caption too long")
        String caption,

        UUID outfitId,

        Visibility visibility
) {}
