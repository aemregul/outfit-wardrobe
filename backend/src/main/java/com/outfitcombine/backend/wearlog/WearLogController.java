package com.outfitcombine.backend.wearlog;

import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.wearlog.dto.WearLogRequest;
import com.outfitcombine.backend.wearlog.dto.WearLogResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Wear Logs", description = "Track when and where outfits were worn")
@SecurityRequirement(name = "bearerAuth")
public class WearLogController {

    private final WearLogService service;

    public WearLogController(WearLogService service) {
        this.service = service;
    }

    @PostMapping("/api/v1/outfits/{outfitId}/wear")
    @Operation(summary = "Mark an outfit as worn",
               description = "Creates a wear log entry and increments wearCount on all clothing items in the outfit.")
    public ResponseEntity<ApiResponse<WearLogResponse>> markWorn(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID outfitId,
            @Valid @RequestBody(required = false) WearLogRequest request) {
        WearLogResponse response = service.markWorn(jwt, outfitId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Outfit marked as worn", response));
    }

    @GetMapping("/api/v1/wear-logs")
    @Operation(summary = "List my wear history",
               description = "Returns all wear logs for the authenticated user. Filter by outfitId, minRating, wouldWearAgain.")
    public ResponseEntity<ApiResponse<Page<WearLogResponse>>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) UUID outfitId,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Boolean wouldWearAgain,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.listMyLogs(jwt, outfitId, minRating, wouldWearAgain, pageable)));
    }

    @GetMapping("/api/v1/wear-logs/{id}")
    @Operation(summary = "Get a wear log by ID")
    public ResponseEntity<ApiResponse<WearLogResponse>> getOne(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyLog(jwt, id)));
    }

    @DeleteMapping("/api/v1/wear-logs/{id}")
    @Operation(summary = "Delete a wear log",
               description = "Removes the wear log entry. Does not reverse the wearCount on clothing items.")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        service.deleteMyLog(jwt, id);
        return ResponseEntity.noContent().build();
    }
}
