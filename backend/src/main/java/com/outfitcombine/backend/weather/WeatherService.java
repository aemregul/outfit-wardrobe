package com.outfitcombine.backend.weather;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class WeatherService {

    private static final int CACHE_TTL_HOURS = 1;

    private final WeatherCacheRepository weatherCacheRepository;
    private final RestClient restClient;
    private final WeatherProperties weatherProperties;

    public WeatherService(WeatherCacheRepository weatherCacheRepository,
                          WeatherProperties weatherProperties) {
        this.weatherCacheRepository = weatherCacheRepository;
        this.weatherProperties = weatherProperties;
        this.restClient = RestClient.builder()
                .baseUrl(weatherProperties.getBaseUrl())
                .build();
    }

    @Transactional
    public WeatherResponse getWeather(double lat, double lon) {
        String cacheKey = buildCacheKey(lat, lon);
        LocalDateTime ttlThreshold = LocalDateTime.now().minusHours(CACHE_TTL_HOURS);

        return weatherCacheRepository
                .findByCacheKeyAndCachedAtAfter(cacheKey, ttlThreshold)
                .map(this::toResponse)
                .orElseGet(() -> fetchAndCache(lat, lon, cacheKey));
    }

    private WeatherResponse fetchAndCache(double lat, double lon, String cacheKey) {
        String apiKey = weatherProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Weather API key is not configured (app.weather.api-key)");
        }

        JsonNode body = restClient.get()
                .uri("/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric", lat, lon, apiKey)
                .retrieve()
                .body(JsonNode.class);

        if (body == null) {
            throw new IllegalStateException("Empty response from weather API");
        }

        double temp = body.path("main").path("temp").asDouble();
        double feelsLike = body.path("main").path("feels_like").asDouble();
        int humidity = body.path("main").path("humidity").asInt();
        String condition = body.path("weather").isArray() && body.path("weather").size() > 0
                ? body.path("weather").get(0).path("description").asText("unknown")
                : "unknown";

        WeatherCache cache = weatherCacheRepository.findByCacheKey(cacheKey).orElse(new WeatherCache());
        cache.setCacheKey(cacheKey);
        cache.setTemperature(BigDecimal.valueOf(temp).setScale(2, RoundingMode.HALF_UP));
        cache.setFeelsLike(BigDecimal.valueOf(feelsLike).setScale(2, RoundingMode.HALF_UP));
        cache.setHumidity(humidity);
        cache.setCondition(condition);
        weatherCacheRepository.save(cache);

        return new WeatherResponse(temp, condition, feelsLike, humidity);
    }

    private WeatherResponse toResponse(WeatherCache cache) {
        return new WeatherResponse(
                cache.getTemperature().doubleValue(),
                cache.getCondition(),
                cache.getFeelsLike().doubleValue(),
                cache.getHumidity()
        );
    }

    private String buildCacheKey(double lat, double lon) {
        double roundedLat = Math.round(lat * 10.0) / 10.0;
        double roundedLon = Math.round(lon * 10.0) / 10.0;
        return roundedLat + "," + roundedLon;
    }
}
