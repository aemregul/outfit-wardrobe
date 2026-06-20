package com.outfitcombine.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OutfitSuggestion(
        List<String> itemIds,
        String reason,
        Double score,
        List<String> tips
) {}
