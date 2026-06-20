package com.outfitcombine.backend.ai.dto;

import com.outfitcombine.backend.wardrobe.ClothingItem;

import java.util.List;

public record OutfitSuggestionContext(
        String occasion,
        String season,
        List<ClothingItem> cleanItems,
        String userPreferencesSummary,
        String weatherSummary
) {}
