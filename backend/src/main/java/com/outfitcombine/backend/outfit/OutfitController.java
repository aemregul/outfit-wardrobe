package com.outfitcombine.backend.outfit;

import com.outfitcombine.backend.common.ratelimit.AiRateLimited;
import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.outfit.dto.AIGenerateRequest;
import com.outfitcombine.backend.outfit.dto.OutfitRequest;
import com.outfitcombine.backend.outfit.dto.OutfitResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/outfits")
@Tag(name = "Outfits", description = "Create and manage outfit combinations")
@SecurityRequirement(name = "bearerAuth")
public class OutfitController {

    private final OutfitService service;

    public OutfitController(OutfitService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Create a manual outfit",
               description = "All clothingItemIds must belong to the authenticated user.")
    public ResponseEntity<ApiResponse<OutfitResponse>> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OutfitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Outfit created", service.create(jwt, request)));
    }

    @GetMapping
    @Operation(summary = "List my outfits",
               description = "Filter by isFavorite, aiGenerated, occasion, season, and style. Paginated.")
    public ResponseEntity<ApiResponse<Page<OutfitResponse>>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Boolean isFavorite,
            @RequestParam(required = false) Boolean aiGenerated,
            @RequestParam(required = false) String occasion,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String style,
            @PageableDefault(size = 20, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                service.listMyOutfits(jwt, isFavorite, aiGenerated, occasion, season, style, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an outfit by ID")
    public ResponseEntity<ApiResponse<OutfitResponse>> getOne(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyOutfit(jwt, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an outfit")
    public ResponseEntity<ApiResponse<OutfitResponse>> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody OutfitRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Outfit updated", service.update(jwt, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an outfit")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        service.delete(jwt, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favorite")
    @Operation(summary = "Add outfit to favorites")
    public ResponseEntity<ApiResponse<OutfitResponse>> addFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Added to favorites", service.addFavorite(jwt, id)));
    }

    @DeleteMapping("/{id}/favorite")
    @Operation(summary = "Remove outfit from favorites")
    public ResponseEntity<ApiResponse<OutfitResponse>> removeFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites", service.removeFavorite(jwt, id)));
    }

    @PostMapping("/generate")
    @AiRateLimited
    @Operation(summary = "Generate an outfit with AI",
               description = "Uses AI to select matching clean items from your wardrobe. Rate limited to 10 requests/minute per user.")
    public ResponseEntity<ApiResponse<OutfitResponse>> generate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody(required = false) AIGenerateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Outfit generated", service.generateOutfit(jwt, request)));
    }
}
