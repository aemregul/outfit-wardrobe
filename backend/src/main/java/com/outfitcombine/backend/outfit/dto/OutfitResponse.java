package com.outfitcombine.backend.outfit.dto;

import com.outfitcombine.backend.wardrobe.dto.ClothingItemResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OutfitResponse(
        UUID id,
        UUID userId,
        String name,
        String description,
        String imageUrl,
        List<ClothingItemResponse> clothingItems,
        String[] occasion,
        String[] seasons,
        String[] styles,
        boolean aiGenerated,
        String aiReason,
        BigDecimal aiScore,
        boolean isFavorite,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
