package com.outfitcombine.backend.outfit;

import com.outfitcombine.backend.ai.AiService;
import com.outfitcombine.backend.ai.dto.OutfitSuggestion;
import com.outfitcombine.backend.ai.dto.OutfitSuggestionContext;
import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.outfit.dto.AIGenerateRequest;
import com.outfitcombine.backend.outfit.dto.OutfitRequest;
import com.outfitcombine.backend.outfit.dto.OutfitResponse;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import com.outfitcombine.backend.wardrobe.ClothingItem;
import com.outfitcombine.backend.wardrobe.ClothingItemRepository;
import com.outfitcombine.backend.wearlog.WearLog;
import com.outfitcombine.backend.wearlog.WearLogRepository;
import com.outfitcombine.backend.weather.WeatherResponse;
import com.outfitcombine.backend.weather.WeatherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final UserProfileRepository userProfileRepository;
    private final WearLogRepository wearLogRepository;
    private final WeatherService weatherService;
    private final OutfitMapper mapper;
    private final AiService aiService;

    public OutfitService(OutfitRepository outfitRepository,
                         ClothingItemRepository clothingItemRepository,
                         UserProfileRepository userProfileRepository,
                         WearLogRepository wearLogRepository,
                         WeatherService weatherService,
                         OutfitMapper mapper,
                         AiService aiService) {
        this.outfitRepository = outfitRepository;
        this.clothingItemRepository = clothingItemRepository;
        this.userProfileRepository = userProfileRepository;
        this.wearLogRepository = wearLogRepository;
        this.weatherService = weatherService;
        this.mapper = mapper;
        this.aiService = aiService;
    }

    @Transactional
    public OutfitResponse create(Jwt jwt, OutfitRequest request) {
        UUID userId = resolveUserId(jwt);
        Set<ClothingItem> items = resolveAndValidateItems(request.clothingItemIds(), userId);

        Outfit outfit = new Outfit();
        outfit.setUserId(userId);
        applyRequest(outfit, request, items);

        return mapper.toResponse(outfitRepository.save(outfit));
    }

    public Page<OutfitResponse> listMyOutfits(Jwt jwt,
                                               Boolean isFavorite,
                                               Boolean aiGenerated,
                                               String occasion,
                                               String season,
                                               String style,
                                               Pageable pageable) {
        UUID userId = resolveUserId(jwt);
        return outfitRepository
                .findFiltered(userId, isFavorite, aiGenerated, occasion, season, style, pageable)
                .map(mapper::toResponse);
    }

    public OutfitResponse getMyOutfit(Jwt jwt, UUID outfitId) {
        return mapper.toResponse(resolveOwnedOutfit(jwt, outfitId));
    }

    @Transactional
    public OutfitResponse update(Jwt jwt, UUID outfitId, OutfitRequest request) {
        Outfit outfit = resolveOwnedOutfit(jwt, outfitId);
        UUID userId = resolveUserId(jwt);
        Set<ClothingItem> items = resolveAndValidateItems(request.clothingItemIds(), userId);
        applyRequest(outfit, request, items);
        return mapper.toResponse(outfitRepository.save(outfit));
    }

    @Transactional
    public void delete(Jwt jwt, UUID outfitId) {
        Outfit outfit = resolveOwnedOutfit(jwt, outfitId);
        outfitRepository.delete(outfit);
    }

    @Transactional
    public OutfitResponse addFavorite(Jwt jwt, UUID outfitId) {
        Outfit outfit = resolveOwnedOutfit(jwt, outfitId);
        outfit.setFavorite(true);
        return mapper.toResponse(outfitRepository.save(outfit));
    }

    @Transactional
    public OutfitResponse removeFavorite(Jwt jwt, UUID outfitId) {
        Outfit outfit = resolveOwnedOutfit(jwt, outfitId);
        outfit.setFavorite(false);
        return mapper.toResponse(outfitRepository.save(outfit));
    }

    @Transactional
    public OutfitResponse generateOutfit(Jwt jwt, AIGenerateRequest request) {
        UUID userId = resolveUserId(jwt);

        List<ClothingItem> cleanItems = clothingItemRepository
                .findFiltered(userId, null, true, null, null, Pageable.unpaged())
                .getContent();

        if (cleanItems.isEmpty()) {
            throw new IllegalArgumentException("No clean clothing items available to generate an outfit.");
        }

        String occasion = request != null ? request.occasion() : null;
        String season = request != null ? request.season() : null;

        String preferenceSummary = buildPreferenceSummary(userId);
        String weatherSummary = buildWeatherSummary(request);
        OutfitSuggestionContext context = new OutfitSuggestionContext(occasion, season, cleanItems, preferenceSummary, weatherSummary);
        OutfitSuggestion suggestion = aiService.suggestOutfit(context);

        Map<UUID, ClothingItem> cleanItemsById = new HashMap<>();
        for (ClothingItem item : cleanItems) {
            cleanItemsById.put(item.getId(), item);
        }

        Set<ClothingItem> selected = new HashSet<>();
        if (suggestion.itemIds() != null) {
            for (String idStr : suggestion.itemIds()) {
                try {
                    UUID id = UUID.fromString(idStr);
                    ClothingItem item = cleanItemsById.get(id);
                    if (item != null) selected.add(item);
                } catch (IllegalArgumentException ignored) {
                }
            }
        }

        if (selected.isEmpty()) {
            throw new IllegalArgumentException(
                    "AI could not select valid items from your wardrobe. Add more clean items and try again.");
        }

        Outfit outfit = new Outfit();
        outfit.setUserId(userId);
        outfit.setName("AI Suggestion — " + LocalDate.now());
        outfit.setDescription(suggestion.tips() != null && !suggestion.tips().isEmpty()
                ? String.join(" | ", suggestion.tips())
                : "Automatically generated from your clean wardrobe items.");
        outfit.setClothingItems(selected);
        outfit.setAiGenerated(true);
        outfit.setAiReason(suggestion.reason());
        outfit.setAiScore(suggestion.score() != null ? BigDecimal.valueOf(suggestion.score()) : null);

        if (occasion != null) outfit.setOccasion(new String[]{occasion});
        if (season != null) outfit.setSeasons(new String[]{season});

        return mapper.toResponse(outfitRepository.save(outfit));
    }

    // --- private helpers ---

    private String buildWeatherSummary(AIGenerateRequest request) {
        if (request == null || request.lat() == null || request.lon() == null) return null;
        try {
            WeatherResponse w = weatherService.getWeather(request.lat(), request.lon());
            return String.format("Today's weather: %.1f°C, %s. Feels like %.1f°C. Humidity: %d%%.",
                    w.temperature(), w.condition(), w.feelsLike(), w.humidity());
        } catch (Exception e) {
            return null;
        }
    }

    private String buildPreferenceSummary(UUID userId) {
        List<WearLog> recentLogs = wearLogRepository
                .findByUserIdOrderByWornAtDesc(userId, PageRequest.of(0, 20))
                .getContent();

        if (recentLogs.isEmpty()) return null;

        List<WearLog> highRated = recentLogs.stream()
                .filter(l -> l.getRating() != null && l.getRating() >= 4)
                .collect(Collectors.toList());
        List<WearLog> lowRated = recentLogs.stream()
                .filter(l -> l.getRating() != null && l.getRating() <= 2)
                .collect(Collectors.toList());
        long wouldWearAgainCount = recentLogs.stream()
                .filter(l -> Boolean.TRUE.equals(l.getWouldWearAgain()))
                .count();

        List<String> preferredStyles = new ArrayList<>();
        if (!highRated.isEmpty()) {
            Set<UUID> highRatedOutfitIds = highRated.stream()
                    .map(WearLog::getOutfitId)
                    .collect(Collectors.toSet());
            outfitRepository.findAllById(highRatedOutfitIds).forEach(outfit -> {
                if (outfit.getStyles() != null) {
                    Collections.addAll(preferredStyles, outfit.getStyles());
                }
            });
        }

        List<String> likedOccasions = highRated.stream()
                .map(WearLog::getOccasion)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        List<String> dislikedOccasions = lowRated.stream()
                .map(WearLog::getOccasion)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder("User preference signals from wear history:\n");
        if (!preferredStyles.isEmpty()) {
            String styles = preferredStyles.stream().distinct().collect(Collectors.joining(", "));
            sb.append("- Styles from top-rated outfits: ").append(styles).append("\n");
        }
        if (!likedOccasions.isEmpty()) {
            sb.append("- Well-rated occasions: ").append(String.join(", ", likedOccasions)).append("\n");
        }
        if (!dislikedOccasions.isEmpty()) {
            sb.append("- Poorly-rated occasions (avoid these styles): ").append(String.join(", ", dislikedOccasions)).append("\n");
        }
        if (wouldWearAgainCount > 0) {
            sb.append("- Would wear again: ").append(wouldWearAgainCount)
              .append(" of last ").append(recentLogs.size()).append(" outfits\n");
        }

        return sb.toString();
    }

    private Set<ClothingItem> resolveAndValidateItems(List<UUID> ids, UUID userId) {
        Set<ClothingItem> items = new HashSet<>();
        for (UUID id : ids) {
            ClothingItem item = clothingItemRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Clothing item not found or does not belong to you: " + id));
            items.add(item);
        }
        return items;
    }

    private void applyRequest(Outfit outfit, OutfitRequest request, Set<ClothingItem> items) {
        outfit.setName(request.name());
        outfit.setDescription(request.description());
        outfit.setOccasion(request.occasion());
        outfit.setSeasons(request.seasons());
        outfit.setStyles(request.styles());
        outfit.setClothingItems(items);
    }

    private Outfit resolveOwnedOutfit(Jwt jwt, UUID outfitId) {
        UUID userId = resolveUserId(jwt);
        return outfitRepository.findByIdAndUserId(outfitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Outfit", "id", outfitId));
    }

    private UUID resolveUserId(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        UserProfile profile = userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first to initialize your profile."));
        return profile.getId();
    }
}
