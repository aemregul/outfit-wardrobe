package com.outfitcombine.backend.outfit.dto;

public record AIGenerateRequest(
        String occasion,
        String season,
        Double lat,
        Double lon
) {}
