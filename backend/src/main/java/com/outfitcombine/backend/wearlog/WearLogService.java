package com.outfitcombine.backend.wearlog;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.outfit.Outfit;
import com.outfitcombine.backend.outfit.OutfitRepository;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import com.outfitcombine.backend.wardrobe.ClothingItem;
import com.outfitcombine.backend.wardrobe.ClothingItemRepository;
import com.outfitcombine.backend.wearlog.dto.WearLogRequest;
import com.outfitcombine.backend.wearlog.dto.WearLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class WearLogService {

    private final WearLogRepository wearLogRepository;
    private final OutfitRepository outfitRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final UserProfileRepository userProfileRepository;
    private final WearLogMapper mapper;

    public WearLogService(WearLogRepository wearLogRepository,
                          OutfitRepository outfitRepository,
                          ClothingItemRepository clothingItemRepository,
                          UserProfileRepository userProfileRepository,
                          WearLogMapper mapper) {
        this.wearLogRepository = wearLogRepository;
        this.outfitRepository = outfitRepository;
        this.clothingItemRepository = clothingItemRepository;
        this.userProfileRepository = userProfileRepository;
        this.mapper = mapper;
    }

    /**
     * Marks an outfit as worn:
     * 1. Creates a WearLog record
     * 2. Increments wearCount on every ClothingItem in the outfit
     * 3. Updates lastWornAt on every ClothingItem
     */
    @Transactional
    public WearLogResponse markWorn(Jwt jwt, UUID outfitId, WearLogRequest request) {
        UUID userId = resolveUserId(jwt);

        Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));

        LocalDateTime wornAt = (request != null && request.wornAt() != null)
                ? request.wornAt()
                : LocalDateTime.now();

        WearLog log = buildLog(userId, outfitId, wornAt, request);
        WearLog saved = wearLogRepository.save(log);

        updateClothingItemStats(outfit, wornAt);

        return mapper.toResponse(saved);
    }

    public Page<WearLogResponse> listMyLogs(Jwt jwt, UUID outfitId, Integer minRating, Boolean wouldWearAgain, Pageable pageable) {
        UUID userId = resolveUserId(jwt);
        Specification<WearLog> spec = buildSpec(userId, outfitId, minRating, wouldWearAgain);
        return wearLogRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    private static Specification<WearLog> buildSpec(UUID userId, UUID outfitId, Integer minRating, Boolean wouldWearAgain) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.equal(root.get("userId"), userId));
            if (outfitId != null) predicates.add(cb.equal(root.get("outfitId"), outfitId));
            if (minRating != null) predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            if (wouldWearAgain != null) predicates.add(cb.equal(root.get("wouldWearAgain"), wouldWearAgain));
            query.orderBy(cb.desc(root.get("wornAt")));
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    public WearLogResponse getMyLog(Jwt jwt, UUID logId) {
        UUID userId = resolveUserId(jwt);
        WearLog log = wearLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WearLog", "id", logId));
        return mapper.toResponse(log);
    }

    @Transactional
    public void deleteMyLog(Jwt jwt, UUID logId) {
        UUID userId = resolveUserId(jwt);
        WearLog log = wearLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WearLog", "id", logId));
        wearLogRepository.delete(log);
        // wearCount is NOT reversed — the outfit was actually worn
    }

    // --- private helpers ---

    private void updateClothingItemStats(Outfit outfit, LocalDateTime wornAt) {
        for (ClothingItem item : outfit.getClothingItems()) {
            item.setWearCount(item.getWearCount() + 1);
            if (item.getLastWornAt() == null || wornAt.isAfter(item.getLastWornAt())) {
                item.setLastWornAt(wornAt);
            }
        }
        clothingItemRepository.saveAll(outfit.getClothingItems());
    }

    private WearLog buildLog(UUID userId, UUID outfitId, LocalDateTime wornAt, WearLogRequest request) {
        WearLog log = new WearLog();
        log.setUserId(userId);
        log.setOutfitId(outfitId);
        log.setWornAt(wornAt);

        if (request != null) {
            log.setLocation(request.location());
            log.setOccasion(request.occasion());
            log.setRating(request.rating());
            log.setPhotoUrl(request.photoUrl());
            log.setNote(request.note());
            log.setWouldWearAgain(request.wouldWearAgain());
        }
        return log;
    }

    private UUID resolveUserId(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        UserProfile profile = userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first to initialize your profile."));
        return profile.getId();
    }
}
