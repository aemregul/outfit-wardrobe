package com.outfitcombine.backend.outfit;

import com.outfitcombine.backend.outfit.dto.OutfitResponse;
import com.outfitcombine.backend.wardrobe.ClothingItemMapper;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OutfitMapper {

    private final ClothingItemMapper clothingItemMapper;

    public OutfitMapper(ClothingItemMapper clothingItemMapper) {
        this.clothingItemMapper = clothingItemMapper;
    }

    public OutfitResponse toResponse(Outfit outfit) {
        List<ClothingItemResponse> items = outfit.getClothingItems().stream()
                .map(clothingItemMapper::toResponse)
                .toList();

        return new OutfitResponse(
                outfit.getId(),
                outfit.getUserId(),
                outfit.getName(),
                outfit.getDescription(),
                outfit.getImageUrl(),
                items,
                outfit.getOccasion(),
                outfit.getSeasons(),
                outfit.getStyles(),
                outfit.isAiGenerated(),
                outfit.getAiReason(),
                outfit.getAiScore(),
                outfit.isFavorite(),
                outfit.getCreatedAt(),
                outfit.getUpdatedAt()
        );
    }
}
