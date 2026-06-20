package com.outfitcombine.backend.wardrobe.dto;

import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClothingItemRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Name too long")
        String name,

        @NotNull(message = "Category is required")
        ClothingCategory category,

        String subCategory,
        String imageUrl,
        String[] colors,
        String brand,
        String size,
        String[] seasons,
        String[] styles,
        String material,
        String pattern,
        String productUrl,
        String notes,
        String aiAnalysisJson
) {}
