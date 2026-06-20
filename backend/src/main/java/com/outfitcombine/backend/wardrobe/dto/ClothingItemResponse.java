package com.outfitcombine.backend.wardrobe.dto;

import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClothingItemResponse(
        UUID id,
        UUID userId,
        String name,
        String imageUrl,
        ClothingCategory category,
        String subCategory,
        String[] colors,
        String brand,
        String size,
        String[] seasons,
        String[] styles,
        String material,
        String pattern,
        String productUrl,
        boolean isClean,
        int wearCount,
        LocalDateTime lastWornAt,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
