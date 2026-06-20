package com.outfitcombine.backend.weather;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeatherCacheRepository extends JpaRepository<WeatherCache, UUID> {

    Optional<WeatherCache> findByCacheKeyAndCachedAtAfter(String cacheKey, LocalDateTime after);

    Optional<WeatherCache> findByCacheKey(String cacheKey);
}
