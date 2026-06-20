package com.outfitcombine.backend.wearlog;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.outfit.Outfit;
import com.outfitcombine.backend.outfit.OutfitRepository;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import com.outfitcombine.backend.wardrobe.ClothingItem;
import com.outfitcombine.backend.wardrobe.ClothingItemRepository;
import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
import com.outfitcombine.backend.wearlog.dto.WearLogRequest;
import com.outfitcombine.backend.wearlog.dto.WearLogResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WearLogServiceTest {

    @Mock private WearLogRepository wearLogRepository;
    @Mock private OutfitRepository outfitRepository;
    @Mock private ClothingItemRepository clothingItemRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private WearLogMapper mapper;

    @InjectMocks
    private WearLogService service;

    private Jwt jwt;
    private UserProfile userProfile;
    private Outfit outfit;
    private ClothingItem topItem;
    private ClothingItem bottomItem;
    private UUID outfitId;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        outfitId = UUID.randomUUID();

        jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", "keycloak-user-123")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        userProfile = new UserProfile();
        userProfile.setKeycloakUserId("keycloak-user-123");

        topItem = new ClothingItem();
        topItem.setUserId(userId);
        topItem.setCategory(ClothingCategory.TOP);
        topItem.setWearCount(2);

        bottomItem = new ClothingItem();
        bottomItem.setUserId(userId);
        bottomItem.setCategory(ClothingCategory.BOTTOM);
        bottomItem.setWearCount(0);

        outfit = new Outfit();
        outfit.setUserId(userProfile.getId());
        outfit.setClothingItems(Set.of(topItem, bottomItem));
    }

    @Test
    void markWorn_createsLogAndIncrementsWearCount() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.of(outfit));
        when(wearLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(clothingItemRepository.saveAll(any())).thenReturn(null);
        when(mapper.toResponse(any())).thenReturn(mock(WearLogResponse.class));

        service.markWorn(jwt, outfitId, null);

        assertThat(topItem.getWearCount()).isEqualTo(3);
        assertThat(bottomItem.getWearCount()).isEqualTo(1);
        verify(clothingItemRepository).saveAll(outfit.getClothingItems());
    }

    @Test
    void markWorn_setsLastWornAtOnItems() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.of(outfit));
        when(wearLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(clothingItemRepository.saveAll(any())).thenReturn(null);
        when(mapper.toResponse(any())).thenReturn(mock(WearLogResponse.class));

        LocalDateTime specificDate = LocalDateTime.of(2026, 1, 15, 10, 0);
        WearLogRequest request = new WearLogRequest(specificDate, "Istanbul", "Dinner", 5, null, null, true);

        service.markWorn(jwt, outfitId, request);

        assertThat(topItem.getLastWornAt()).isEqualTo(specificDate);
        assertThat(bottomItem.getLastWornAt()).isEqualTo(specificDate);
    }

    @Test
    void markWorn_usesNowWhenWornAtNotProvided() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.of(outfit));
        when(wearLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(clothingItemRepository.saveAll(any())).thenReturn(null);
        when(mapper.toResponse(any())).thenReturn(mock(WearLogResponse.class));

        LocalDateTime before = LocalDateTime.now().minusSeconds(1);
        service.markWorn(jwt, outfitId, null);

        assertThat(topItem.getLastWornAt()).isAfter(before);
    }

    @Test
    void markWorn_throwsWhenOutfitNotOwned() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.markWorn(jwt, outfitId, null))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(wearLogRepository, never()).save(any());
    }

    @Test
    void deleteMyLog_throwsWhenLogNotOwned() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        UUID logId = UUID.randomUUID();
        when(wearLogRepository.findByIdAndUserId(logId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteMyLog(jwt, logId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(wearLogRepository, never()).delete(any(WearLog.class));
    }

    @Test
    void markWorn_doesNotDecreaseWearCountOnExistingHistory() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(outfitRepository.findByIdAndUserId(outfitId, userProfile.getId())).thenReturn(Optional.of(outfit));
        when(wearLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(clothingItemRepository.saveAll(any())).thenReturn(null);
        when(mapper.toResponse(any())).thenReturn(mock(WearLogResponse.class));

        int initialCount = topItem.getWearCount();
        service.markWorn(jwt, outfitId, null);

        assertThat(topItem.getWearCount()).isGreaterThan(initialCount);
    }
}
