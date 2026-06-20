package com.outfitcombine.backend.outfit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record OutfitRequest(
        @NotBlank(message = "Outfit name is required")
        @Size(max = 255, message = "Name too long")
        String name,

        @Size(max = 1000, message = "Description too long")
        String description,

        @NotEmpty(message = "At least one clothing item is required")
        List<UUID> clothingItemIds,

        String[] occasion,
        String[] seasons,
        String[] styles
) {}
