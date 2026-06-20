package com.outfitcombine.backend.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.outfitcombine.backend.ai.dto.ClothingAnalysisResult;
import com.outfitcombine.backend.ai.dto.OutfitSuggestion;
import com.outfitcombine.backend.ai.dto.OutfitSuggestionContext;
import com.outfitcombine.backend.config.MinioProperties;
import com.outfitcombine.backend.wardrobe.ClothingItem;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClaudeAiService implements AiService {

    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AiProperties aiProperties;
    private final MinioProperties minioProperties;
    private final AiOutputValidator validator;

    public ClaudeAiService(AiProperties aiProperties,
                           MinioProperties minioProperties,
                           ObjectMapper objectMapper,
                           AiOutputValidator validator) {
        this.aiProperties = aiProperties;
        this.minioProperties = minioProperties;
        this.objectMapper = objectMapper;
        this.validator = validator;
        this.restClient = RestClient.builder()
                .baseUrl(aiProperties.getBaseUrl())
                .defaultHeader("x-api-key", aiProperties.getApiKey() != null ? aiProperties.getApiKey() : "")
                .defaultHeader("anthropic-version", ANTHROPIC_VERSION)
                .defaultHeader("content-type", "application/json")
                .build();
    }

    @Override
    public ClothingAnalysisResult analyzeClothing(String imageUrl) {
        validateApiKey();
        validateImageUrl(imageUrl);

        String prompt = """
                Analyze this clothing item image and respond ONLY with valid JSON (no explanation, no markdown):
                {
                  "category": "TOPS|BOTTOMS|DRESSES|OUTERWEAR|SHOES|ACCESSORIES|BAGS|UNDERWEAR|SPORTSWEAR|SWIMWEAR|SLEEPWEAR|SUITS|OTHER",
                  "subCategory": "string",
                  "colors": ["string"],
                  "styles": ["CASUAL|FORMAL|BUSINESS|SPORTY|ELEGANT|BOHEMIAN|STREETWEAR|MINIMALIST|VINTAGE|ROMANTIC|EDGY|PREPPY"],
                  "seasons": ["SPRING|SUMMER|AUTUMN|WINTER|ALL_SEASON"],
                  "material": "string",
                  "pattern": "string",
                  "occasions": ["string"],
                  "confidenceScore": 0.0
                }
                """;

        List<Map<String, Object>> content = List.of(
                Map.of(
                        "type", "image",
                        "source", Map.of("type", "url", "url", imageUrl)
                ),
                Map.of("type", "text", "text", prompt)
        );

        String rawJson = callClaude(content);
        return validator.validate(parseJson(rawJson, ClothingAnalysisResult.class));
    }

    @Override
    public OutfitSuggestion suggestOutfit(OutfitSuggestionContext context) {
        validateApiKey();
        String itemsJson = buildItemsJson(context.cleanItems());

        String preferenceSection = (context.userPreferencesSummary() != null
                && !context.userPreferencesSummary().isBlank())
                ? "User preferences:\n" + context.userPreferencesSummary() + "\n\n"
                : "";

        String weatherSection = (context.weatherSummary() != null
                && !context.weatherSummary().isBlank())
                ? "Weather context: " + context.weatherSummary() + "\n\n"
                : "";

        String prompt = """
                %s%sUser wants an outfit for: %s
                Season: %s
                Available clean clothing items:
                %s

                Return ONLY valid JSON (no explanation, no markdown):
                {
                  "itemIds": ["uuid1", "uuid2"],
                  "reason": "Why this combination works",
                  "score": 0.85,
                  "tips": ["styling tip 1"]
                }

                Rules:
                - Include at least one top, one bottom (or a dress)
                - Suggest shoes if available
                - Consider color harmony and match style to occasion
                - If weather is provided, prefer appropriate fabrics and layers
                - Do NOT select more than 6 items total
                - itemIds must be valid UUIDs from the provided list
                """.formatted(
                preferenceSection,
                weatherSection,
                context.occasion() != null ? context.occasion() : "casual",
                context.season() != null ? context.season() : "ALL_SEASON",
                itemsJson
        );

        List<Map<String, Object>> content = List.of(
                Map.of("type", "text", "text", prompt)
        );

        String rawJson = callClaude(content);
        return validator.validate(parseJson(rawJson, OutfitSuggestion.class));
    }

    // --- private helpers ---

    private void validateApiKey() {
        String key = aiProperties.getApiKey();
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("ANTHROPIC_API_KEY is required but not configured");
        }
    }

    private String callClaude(List<Map<String, Object>> messageContent) {
        Map<String, Object> body = Map.of(
                "model", aiProperties.getModel(),
                "max_tokens", 1024,
                "messages", List.of(Map.of("role", "user", "content", messageContent))
        );

        JsonNode response = restClient.post()
                .uri("/v1/messages")
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.has("content")) {
            throw new AiException("Empty response from Claude API");
        }

        JsonNode contentArray = response.get("content");
        if (!contentArray.isArray() || contentArray.isEmpty()) {
            throw new AiException("No content in Claude API response");
        }

        String text = contentArray.get(0).path("text").asText();
        return extractJson(text);
    }

    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start == -1 || end == -1 || end <= start) {
            throw new AiException("Could not extract JSON from AI response: " + text);
        }
        return text.substring(start, end + 1);
    }

    private <T> T parseJson(String json, Class<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            throw new AiException("Failed to parse AI response as " + type.getSimpleName() + ": " + e.getMessage());
        }
    }

    private void validateImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            throw new IllegalArgumentException("imageUrl must not be blank");
        }
        String publicUrl = minioProperties.getPublicUrl();
        if (publicUrl != null && !publicUrl.isBlank() && !imageUrl.startsWith(publicUrl)) {
            throw new IllegalArgumentException(
                    "imageUrl must be a MinIO-hosted URL. Provided: " + imageUrl);
        }
    }

    private String buildItemsJson(List<ClothingItem> items) {
        List<Map<String, Object>> itemMaps = items.stream()
                .map(item -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", item.getId().toString());
                    map.put("name", item.getName());
                    map.put("category", item.getCategory().name());
                    if (item.getSubCategory() != null) map.put("subCategory", item.getSubCategory());
                    if (item.getColors() != null) map.put("colors", Arrays.asList(item.getColors()));
                    if (item.getStyles() != null) map.put("styles", Arrays.asList(item.getStyles()));
                    if (item.getSeasons() != null) map.put("seasons", Arrays.asList(item.getSeasons()));
                    if (item.getMaterial() != null) map.put("material", item.getMaterial());
                    return map;
                })
                .collect(Collectors.toList());

        try {
            return objectMapper.writeValueAsString(itemMaps);
        } catch (JsonProcessingException e) {
            throw new AiException("Failed to serialize clothing items: " + e.getMessage());
        }
    }
}
