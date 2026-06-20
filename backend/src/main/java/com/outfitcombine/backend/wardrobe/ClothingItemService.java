package com.outfitcombine.backend.wardrobe;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemRequest;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemResponse;
import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ClothingItemService {

    private final ClothingItemRepository clothingItemRepository;
    private final UserProfileRepository userProfileRepository;
    private final ClothingItemMapper mapper;

    public ClothingItemService(ClothingItemRepository clothingItemRepository,
                               UserProfileRepository userProfileRepository,
                               ClothingItemMapper mapper) {
        this.clothingItemRepository = clothingItemRepository;
        this.userProfileRepository = userProfileRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ClothingItemResponse create(Jwt jwt, ClothingItemRequest request) {
        UUID userId = resolveUserId(jwt);
        ClothingItem item = mapper.toEntity(request, userId);
        return mapper.toResponse(clothingItemRepository.save(item));
    }

    public Page<ClothingItemResponse> listMyItems(Jwt jwt,
                                                   ClothingCategory category,
                                                   Boolean isClean,
                                                   String season,
                                                   String style,
                                                   Pageable pageable) {
        UUID userId = resolveUserId(jwt);
        return clothingItemRepository
                .findFiltered(userId,
                        category != null ? category.name() : null,
                        isClean,
                        season,
                        style,
                        pageable)
                .map(mapper::toResponse);
    }

    public ClothingItemResponse getMyItem(Jwt jwt, UUID itemId) {
        return mapper.toResponse(resolveOwnedItem(jwt, itemId));
    }

    @Transactional
    public ClothingItemResponse update(Jwt jwt, UUID itemId, ClothingItemRequest request) {
        ClothingItem item = resolveOwnedItem(jwt, itemId);
        mapper.applyRequest(item, request);
        return mapper.toResponse(clothingItemRepository.save(item));
    }

    @Transactional
    public void delete(Jwt jwt, UUID itemId) {
        ClothingItem item = resolveOwnedItem(jwt, itemId);
        clothingItemRepository.delete(item);
    }

    @Transactional
    public ClothingItemResponse markClean(Jwt jwt, UUID itemId) {
        ClothingItem item = resolveOwnedItem(jwt, itemId);
        item.setClean(true);
        return mapper.toResponse(clothingItemRepository.save(item));
    }

    @Transactional
    public ClothingItemResponse markDirty(Jwt jwt, UUID itemId) {
        ClothingItem item = resolveOwnedItem(jwt, itemId);
        item.setClean(false);
        return mapper.toResponse(clothingItemRepository.save(item));
    }

    private ClothingItem resolveOwnedItem(Jwt jwt, UUID itemId) {
        UUID userId = resolveUserId(jwt);
        return clothingItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ClothingItem", "id", itemId));
    }

    private UUID resolveUserId(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        UserProfile profile = userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first to initialize your profile."));
        return profile.getId();
    }
}
