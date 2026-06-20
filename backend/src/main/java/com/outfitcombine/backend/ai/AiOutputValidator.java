package com.outfitcombine.backend.ai;

import com.outfitcombine.backend.ai.dto.ClothingAnalysisResult;
import com.outfitcombine.backend.ai.dto.OutfitSuggestion;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
public class AiOutputValidator {

    private static final Set<String> VALID_CATEGORIES = Set.of(
            "TOPS", "BOTTOMS", "DRESSES", "OUTERWEAR", "SHOES", "ACCESSORIES",
            "BAGS", "UNDERWEAR", "SPORTSWEAR", "SWIMWEAR", "SLEEPWEAR", "SUITS", "OTHER"
    );

    private static final Set<String> VALID_STYLES = Set.of(
            "CASUAL", "FORMAL", "BUSINESS", "SPORTY", "ELEGANT", "BOHEMIAN",
            "STREETWEAR", "MINIMALIST", "VINTAGE", "ROMANTIC", "EDGY", "PREPPY"
    );

    private static final Set<String> VALID_SEASONS = Set.of(
            "SPRING", "SUMMER", "AUTUMN", "WINTER", "ALL_SEASON"
    );

    public ClothingAnalysisResult validate(ClothingAnalysisResult result) {
        if (result == null) {
            throw new AiException("AI returned null analysis result");
        }

        String category = result.category() != null
                && VALID_CATEGORIES.contains(result.category().toUpperCase())
                ? result.category().toUpperCase()
                : null;

        List<String> styles = filterToKnownValues(result.styles(), VALID_STYLES);
        List<String> seasons = filterToKnownValues(result.seasons(), VALID_SEASONS);
        Double score = clampScore(result.confidenceScore());

        return new ClothingAnalysisResult(
                category,
                sanitizeString(result.subCategory(), 100),
                sanitizeStringList(result.colors(), 30, 50),
                styles,
                seasons,
                sanitizeString(result.material(), 255),
                sanitizeString(result.pattern(), 255),
                sanitizeStringList(result.occasions(), 20, 100),
                score
        );
    }

    public OutfitSuggestion validate(OutfitSuggestion suggestion) {
        if (suggestion == null) {
            throw new AiException("AI returned null outfit suggestion");
        }
        if (suggestion.itemIds() == null || suggestion.itemIds().isEmpty()) {
            throw new AiException("AI outfit suggestion contains no item IDs");
        }

        List<String> validIds = suggestion.itemIds().stream()
                .filter(id -> {
                    try { UUID.fromString(id); return true; }
                    catch (IllegalArgumentException e) { return false; }
                })
                .toList();

        if (validIds.isEmpty()) {
            throw new AiException("AI outfit suggestion contains no valid UUID item IDs");
        }

        return new OutfitSuggestion(
                validIds,
                sanitizeString(suggestion.reason(), 1000),
                clampScore(suggestion.score()),
                sanitizeStringList(suggestion.tips(), 10, 500)
        );
    }

    // --- helpers ---

    private List<String> filterToKnownValues(List<String> values, Set<String> allowed) {
        if (values == null) return null;
        List<String> filtered = values.stream()
                .filter(v -> v != null && allowed.contains(v.toUpperCase()))
                .map(String::toUpperCase)
                .toList();
        return filtered.isEmpty() ? null : filtered;
    }

    private List<String> sanitizeStringList(List<String> list, int maxItems, int maxLength) {
        if (list == null) return null;
        List<String> sanitized = list.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(s -> s.length() > maxLength ? s.substring(0, maxLength) : s)
                .limit(maxItems)
                .toList();
        return sanitized.isEmpty() ? null : sanitized;
    }

    private String sanitizeString(String value, int maxLength) {
        if (value == null || value.isBlank()) return null;
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }

    private Double clampScore(Double score) {
        if (score == null) return null;
        return Math.max(0.0, Math.min(1.0, score));
    }
}
