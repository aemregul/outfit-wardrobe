package com.outfitcombine.backend.weather;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weather_cache")
public class WeatherCache {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "cache_key", nullable = false, unique = true, length = 50)
    private String cacheKey;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal temperature;

    @Column(nullable = false, length = 255)
    private String condition;

    @Column(name = "feels_like", nullable = false, precision = 5, scale = 2)
    private BigDecimal feelsLike;

    @Column(nullable = false)
    private int humidity;

    @Column(name = "cached_at", nullable = false)
    private LocalDateTime cachedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        cachedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public String getCacheKey() { return cacheKey; }
    public void setCacheKey(String cacheKey) { this.cacheKey = cacheKey; }
    public BigDecimal getTemperature() { return temperature; }
    public void setTemperature(BigDecimal temperature) { this.temperature = temperature; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public BigDecimal getFeelsLike() { return feelsLike; }
    public void setFeelsLike(BigDecimal feelsLike) { this.feelsLike = feelsLike; }
    public int getHumidity() { return humidity; }
    public void setHumidity(int humidity) { this.humidity = humidity; }
    public LocalDateTime getCachedAt() { return cachedAt; }
}
