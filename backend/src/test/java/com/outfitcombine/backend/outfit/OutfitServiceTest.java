package com.outfitcombine.backend.outfit;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.outfit.dto.AIGenerateRequest;
import com.outfitcombine.backend.outfit.dto.OutfitRequest;
import com.outfitcombine.backend.outfit.dto.OutfitResponse;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import com.outfitcombine.backend.wardrobe.ClothingItem;
import com.outfitcombine.backend.wardrobe.ClothingItemRepository;
import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
import com.outfitcombine.backend.ai.AiService;
import com.outfitcombine.backend.ai.dto.OutfitSuggestion;
import com.outfitcombine.backend.weather.WeatherService;
import com.outfitcombine.backend.wearlog.WearLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutfitServiceTest {

    @Mock private OutfitRepository outfitRepository;
    @Mock private ClothingItemRepository clothingItemRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private WearLogRepository wearLogRepository;
    @Mock private WeatherService weatherService;
    @Mock private OutfitMapper mapper;
    @Mock private AiService aiService;

    @InjectMocks
    private OutfitService service;

    private Jwt jwt;
    private UserProfile userProfile;
    private UUID userId;
    private ClothingItem topItem;
    private UUID topItemId;
    private ClothingItem bottomItem;
    private UUID bottomItemId;
    private ClothingItem shoesItem;
    private UUID shoesItemId;

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

        topItemId = UUID.randomUUID();
        topItem = new ClothingItem();
        ReflectionTestUtils.setField(topItem, "id", topItemId);
        topItem.setUserId(userId);
        topItem.setCategory(ClothingCategory.TOP);
        topItem.setClean(true);

        bottomItemId = UUID.randomUUID();
        bottomItem = new ClothingItem();
        ReflectionTestUtils.setField(bottomItem, "id", bottomItemId);
        bottomItem.setUserId(userId);
        bottomItem.setCategory(ClothingCategory.BOTTOM);
        bottomItem.setClean(true);

        shoesItemId = UUID.randomUUID();
        shoesItem = new ClothingItem();
        ReflectionTestUtils.setField(shoesItem, "id", shoesItemId);
        shoesItem.setUserId(userId);
        shoesItem.setCategory(ClothingCategory.SHOES);
        shoesItem.setClean(true);
    }

    @Test
    void create_savesOutfitWithValidatedItems() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID itemId = UUID.randomUUID();
        when(clothingItemRepository.findByIdAndUserId(itemId, userProfile.getId())).thenReturn(Optional.of(topItem));
        when(outfitRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        OutfitResponse mockResponse = mock(OutfitResponse.class);
        when(mapper.toResponse(any())).thenReturn(mockResponse);

        OutfitRequest request = new OutfitRequest("Summer Look", null, List.of(itemId), null, null, null);
        OutfitResponse result = service.create(jwt, request);

        assertThat(result).isEqualTo(mockResponse);
        verify(outfitRepository).save(any(Outfit.class));
    }

    @Test
    void create_throwsWhenItemDoesNotBelongToUser() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID foreignItemId = UUID.randomUUID();
        when(clothingItemRepository.findByIdAndUserId(foreignItemId, userProfile.getId())).thenReturn(Optional.empty());

        OutfitRequest request = new OutfitRequest("Look", null, List.of(foreignItemId), null, null, null);

        assertThatThrownBy(() -> service.create(jwt, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to you");
    }

    @Test
    void addFavorite_setsFavoriteTrue() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        Outfit outfit = new Outfit();
        outfit.setUserId(userProfile.getId());
        outfit.setFavorite(false);
        UUID outfitId = UUID.randomUUID();
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.of(outfit));
        when(outfitRepository.save(outfit)).thenReturn(outfit);
        when(mapper.toResponse(outfit)).thenReturn(mock(OutfitResponse.class));

        service.addFavorite(jwt, outfitId);

        assertThat(outfit.isFavorite()).isTrue();
    }

    @Test
    void removeFavorite_setsFavoriteFalse() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        Outfit outfit = new Outfit();
        outfit.setUserId(userProfile.getId());
        outfit.setFavorite(true);
        UUID outfitId = UUID.randomUUID();
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.of(outfit));
        when(outfitRepository.save(outfit)).thenReturn(outfit);
        when(mapper.toResponse(outfit)).thenReturn(mock(OutfitResponse.class));

        service.removeFavorite(jwt, outfitId);

        assertThat(outfit.isFavorite()).isFalse();
    }

    @Test
    void generateOutfit_picksCleanItemsByCategory() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(clothingItemRepository.findFiltered(userProfile.getId(), null, true, null, null, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(topItem, bottomItem, shoesItem)));
        when(wearLogRepository.findByUserIdOrderByWornAtDesc(any(), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));
        OutfitSuggestion suggestion = new OutfitSuggestion(
                List.of(topItemId.toString(), bottomItemId.toString()),
                "Great combo", 0.9, List.of("Tip 1"));
        when(aiService.suggestOutfit(any())).thenReturn(suggestion);
        when(outfitRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any())).thenReturn(mock(OutfitResponse.class));

        service.generateOutfit(jwt, new AIGenerateRequest("CASUAL", "SUMMER", null, null));

        verify(outfitRepository).save(argThat(o -> o.isAiGenerated() && !o.getClothingItems().isEmpty()));
    }

    @Test
    void generateOutfit_throwsWhenNoCleanItems() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(clothingItemRepository.findFiltered(userProfile.getId(), null, true, null, null, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of()));

        assertThatThrownBy(() -> service.generateOutfit(jwt, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("No clean clothing items");
    }

    @Test
    void listMyOutfits_filterByIsFavorite_passesParamToRepo() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        Outfit outfit = new Outfit();
        outfit.setUserId(userProfile.getId());
        outfit.setFavorite(true);
        when(outfitRepository.findFiltered(userProfile.getId(), true, null, null, null, null, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(outfit)));
        when(mapper.toResponse(outfit)).thenReturn(mock(OutfitResponse.class));

        service.listMyOutfits(jwt, true, null, null, null, null, Pageable.unpaged());

        verify(outfitRepository).findFiltered(userProfile.getId(), true, null, null, null, null, Pageable.unpaged());
    }

    @Test
    void listMyOutfits_filterByAiGenerated_passesParamToRepo() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        Outfit outfit = new Outfit();
        outfit.setUserId(userProfile.getId());
        outfit.setAiGenerated(true);
        when(outfitRepository.findFiltered(userProfile.getId(), null, true, null, null, null, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(outfit)));
        when(mapper.toResponse(outfit)).thenReturn(mock(OutfitResponse.class));

        service.listMyOutfits(jwt, null, true, null, null, null, Pageable.unpaged());

        verify(outfitRepository).findFiltered(userProfile.getId(), null, true, null, null, null, Pageable.unpaged());
    }

    @Test
    void getMyOutfit_throwsWhenOutfitNotOwned() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID outfitId = UUID.randomUUID();
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMyOutfit(jwt, outfitId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
