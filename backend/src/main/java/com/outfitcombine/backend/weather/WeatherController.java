package com.outfitcombine.backend.weather;

import com.outfitcombine.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/weather")
@Tag(name = "Weather", description = "Current weather for outfit suggestions")
@SecurityRequirement(name = "bearerAuth")
@Validated
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    @Operation(summary = "Get current weather by coordinates")
    public ResponseEntity<ApiResponse<WeatherResponse>> getWeather(
            @RequestParam @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double lat,
            @RequestParam @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double lon) {
        WeatherResponse weather = weatherService.getWeather(lat, lon);
        return ResponseEntity.ok(ApiResponse.success("Weather fetched", weather));
    }
}
