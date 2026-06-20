package com.outfitcombine.backend.wardrobe;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemRequest;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemResponse;
import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClothingItemServiceTest {

    @Mock private ClothingItemRepository clothingItemRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private ClothingItemMapper mapper;

    @InjectMocks
    private ClothingItemService service;

    private Jwt jwt;
    private UserProfile userProfile;
    private UUID userId;
    private ClothingItem clothingItem;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", "keycloak-user-123")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        userProfile = new UserProfile();
        userProfile.setKeycloakUserId("keycloak-user-123");

        clothingItem = new ClothingItem();
        clothingItem.setUserId(userId);
        clothingItem.setName("Black Blazer");
        clothingItem.setCategory(ClothingCategory.OUTERWEAR);
    }

    @Test
    void create_savesAndReturnsResponse() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(mapper.toEntity(any(), eq(userProfile.getId()))).thenReturn(clothingItem);
        when(clothingItemRepository.save(clothingItem)).thenReturn(clothingItem);
        ClothingItemResponse mockResponse = mock(ClothingItemResponse.class);
        when(mapper.toResponse(clothingItem)).thenReturn(mockResponse);

        ClothingItemRequest request = new ClothingItemRequest(
                "Black Blazer", ClothingCategory.OUTERWEAR,
                null, null, null, null, null, null, null, null, null, null, null, null);

        ClothingItemResponse result = service.create(jwt, request);

        assertThat(result).isEqualTo(mockResponse);
        verify(clothingItemRepository).save(clothingItem);
    }

    @Test
    void listMyItems_withNoFilters_returnsPaginatedResults() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        PageRequest pageable = PageRequest.of(0, 20);
        Page<ClothingItem> itemPage = new PageImpl<>(List.of(clothingItem));
        when(clothingItemRepository.findFiltered(userProfile.getId(), null, null, null, null, pageable))
                .thenReturn(itemPage);
        ClothingItemResponse mockResponse = mock(ClothingItemResponse.class);
        when(mapper.toResponse(clothingItem)).thenReturn(mockResponse);

        Page<ClothingItemResponse> result = service.listMyItems(jwt, null, null, null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void listMyItems_filterByCategory_passesNameToQuery() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        PageRequest pageable = PageRequest.of(0, 20);
        when(clothingItemRepository.findFiltered(userProfile.getId(), "OUTERWEAR", null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(clothingItem)));
        when(mapper.toResponse(clothingItem)).thenReturn(mock(ClothingItemResponse.class));

        Page<ClothingItemResponse> result = service.listMyItems(jwt, ClothingCategory.OUTERWEAR, null, null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(clothingItemRepository).findFiltered(userProfile.getId(), "OUTERWEAR", null, null, null, pageable);
    }

    @Test
    void listMyItems_filterBySeason_returnsMatchingItems() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        PageRequest pageable = PageRequest.of(0, 20);
        when(clothingItemRepository.findFiltered(userProfile.getId(), null, null, "SUMMER", null, pageable))
                .thenReturn(new PageImpl<>(List.of(clothingItem)));
        when(mapper.toResponse(clothingItem)).thenReturn(mock(ClothingItemResponse.class));

        Page<ClothingItemResponse> result = service.listMyItems(jwt, null, null, "SUMMER", null, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(clothingItemRepository).findFiltered(userProfile.getId(), null, null, "SUMMER", null, pageable);
    }

    @Test
    void listMyItems_filterByStyle_returnsMatchingItems() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        PageRequest pageable = PageRequest.of(0, 20);
        when(clothingItemRepository.findFiltered(userProfile.getId(), null, null, null, "CASUAL", pageable))
                .thenReturn(new PageImpl<>(List.of(clothingItem)));
        when(mapper.toResponse(clothingItem)).thenReturn(mock(ClothingItemResponse.class));

        Page<ClothingItemResponse> result = service.listMyItems(jwt, null, null, null, "CASUAL", pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(clothingItemRepository).findFiltered(userProfile.getId(), null, null, null, "CASUAL", pageable);
    }

    @Test
    void getMyItem_throwsWhenItemBelongsToOtherUser() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID itemId = UUID.randomUUID();
        when(clothingItemRepository.findByIdAndUserId(itemId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMyItem(jwt, itemId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void markClean_setsIsCleanTrue() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID itemId = UUID.randomUUID();
        clothingItem.setClean(false);
        when(clothingItemRepository.findByIdAndUserId(itemId, userProfile.getId())).thenReturn(Optional.of(clothingItem));
        when(clothingItemRepository.save(clothingItem)).thenReturn(clothingItem);
        when(mapper.toResponse(clothingItem)).thenReturn(mock(ClothingItemResponse.class));

        service.markClean(jwt, itemId);

        assertThat(clothingItem.isClean()).isTrue();
    }

    @Test
    void markDirty_setsIsCleanFalse() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID itemId = UUID.randomUUID();
        clothingItem.setClean(true);
        when(clothingItemRepository.findByIdAndUserId(itemId, userProfile.getId())).thenReturn(Optional.of(clothingItem));
        when(clothingItemRepository.save(clothingItem)).thenReturn(clothingItem);
        when(mapper.toResponse(clothingItem)).thenReturn(mock(ClothingItemResponse.class));

        service.markDirty(jwt, itemId);

        assertThat(clothingItem.isClean()).isFalse();
    }

    @Test
    void delete_throwsWhenUserDoesNotOwnItem() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID itemId = UUID.randomUUID();
        when(clothingItemRepository.findByIdAndUserId(itemId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(jwt, itemId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(clothingItemRepository, never()).delete(any());
    }

    @Test
    void create_throwsWhenUserProfileNotFound() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.empty());

        ClothingItemRequest request = new ClothingItemRequest(
                "Shirt", ClothingCategory.TOP,
                null, null, null, null, null, null, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.create(jwt, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("UserProfile not found");
    }
}
