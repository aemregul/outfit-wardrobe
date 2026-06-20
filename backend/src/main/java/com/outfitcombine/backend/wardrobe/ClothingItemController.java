package com.outfitcombine.backend.wardrobe;

import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemRequest;
import com.outfitcombine.backend.wardrobe.dto.ClothingItemResponse;
import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
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
@RequestMapping("/api/v1/clothing")
@Tag(name = "Wardrobe", description = "Manage clothing items in your digital wardrobe")
@SecurityRequirement(name = "bearerAuth")
public class ClothingItemController {

    private final ClothingItemService service;

    public ClothingItemController(ClothingItemService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Add a clothing item to your wardrobe")
    public ResponseEntity<ApiResponse<ClothingItemResponse>> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ClothingItemRequest request) {
        ClothingItemResponse response = service.create(jwt, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Clothing item added", response));
    }

    @GetMapping
    @Operation(summary = "List your clothing items",
               description = "Supports filtering by category, isClean, season, and style. Paginated.")
    public ResponseEntity<ApiResponse<Page<ClothingItemResponse>>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) ClothingCategory category,
            @RequestParam(required = false) Boolean isClean,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String style,
            @PageableDefault(size = 20, sort = "created_at", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ClothingItemResponse> page = service.listMyItems(jwt, category, isClean, season, style, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a clothing item by ID")
    public ResponseEntity<ApiResponse<ClothingItemResponse>> getOne(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyItem(jwt, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a clothing item")
    public ResponseEntity<ApiResponse<ClothingItemResponse>> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody ClothingItemRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Clothing item updated", service.update(jwt, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a clothing item")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        service.delete(jwt, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/mark-clean")
    @Operation(summary = "Mark a clothing item as clean")
    public ResponseEntity<ApiResponse<ClothingItemResponse>> markClean(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Marked as clean", service.markClean(jwt, id)));
    }

    @PostMapping("/{id}/mark-dirty")
    @Operation(summary = "Mark a clothing item as dirty")
    public ResponseEntity<ApiResponse<ClothingItemResponse>> markDirty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Marked as dirty", service.markDirty(jwt, id)));
    }
}
