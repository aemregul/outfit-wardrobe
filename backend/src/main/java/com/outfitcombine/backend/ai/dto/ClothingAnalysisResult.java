package com.outfitcombine.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ClothingAnalysisResult(
        String category,
        String subCategory,
        List<String> colors,
        List<String> styles,
        List<String> seasons,
        String material,
        String pattern,
        List<String> occasions,
        Double confidenceScore
) {}
