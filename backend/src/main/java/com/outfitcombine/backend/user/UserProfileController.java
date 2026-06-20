package com.outfitcombine.backend.user;

import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.user.dto.UserProfileRequest;
import com.outfitcombine.backend.user.dto.UserProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me")
@Tag(name = "User Profile", description = "Manage the authenticated user's profile")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserProfileService service;

    public UserProfileController(UserProfileService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get current user profile",
               description = "Returns the profile of the authenticated user. Creates one automatically on first login.")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMe(@AuthenticationPrincipal Jwt jwt) {
        UserProfileResponse response = service.getOrCreateCurrentUser(jwt);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserProfileRequest request) {
        UserProfileResponse response = service.updateCurrentUser(jwt, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", response));
    }
}
