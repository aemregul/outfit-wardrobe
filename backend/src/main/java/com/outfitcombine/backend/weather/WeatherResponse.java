package com.outfitcombine.backend.weather;

public record WeatherResponse(
        double temperature,
        String condition,
        double feelsLike,
        int humidity
) {}
