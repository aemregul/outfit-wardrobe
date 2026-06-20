package com.outfitcombine.backend.ai;

import jakarta.validation.constraints.NotBlank;

public record ClothingAnalyzeRequest(
        @NotBlank String imageUrl
) {}
