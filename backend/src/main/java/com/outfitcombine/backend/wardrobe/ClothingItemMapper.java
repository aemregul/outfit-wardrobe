package com.outfitcombine.backend.wardrobe;

import com.outfitcombine.backend.wardrobe.dto.ClothingItemRequest;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemResponse;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ClothingItemMapper {

    public ClothingItem toEntity(ClothingItemRequest request, UUID userId) {
        ClothingItem item = new ClothingItem();
        item.setUserId(userId);
        applyRequest(item, request);
        return item;
    }

    public void applyRequest(ClothingItem item, ClothingItemRequest request) {
        item.setName(request.name());
        item.setCategory(request.category());
        item.setSubCategory(request.subCategory());
        item.setImageUrl(request.imageUrl());
        item.setColors(request.colors());
        item.setBrand(request.brand());
        item.setSize(request.size());
        item.setSeasons(request.seasons());
        item.setStyles(request.styles());
        item.setMaterial(request.material());
        item.setPattern(request.pattern());
        item.setProductUrl(request.productUrl());
        item.setNotes(request.notes());
        item.setAiAnalysisJson(request.aiAnalysisJson());
    }

    public ClothingItemResponse toResponse(ClothingItem item) {
        return new ClothingItemResponse(
                item.getId(),
                item.getUserId(),
                item.getName(),
                item.getImageUrl(),
                item.getCategory(),
                item.getSubCategory(),
                item.getColors(),
                item.getBrand(),
                item.getSize(),
                item.getSeasons(),
                item.getStyles(),
                item.getMaterial(),
                item.getPattern(),
                item.getProductUrl(),
                item.isClean(),
                item.getWearCount(),
                item.getLastWornAt(),
                item.getNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
