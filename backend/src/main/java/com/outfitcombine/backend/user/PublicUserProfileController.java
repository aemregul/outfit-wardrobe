package com.outfitcombine.backend.user;

import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.user.dto.PublicUserProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Public User Profile", description = "Browse other users' public profiles")
@SecurityRequirement(name = "bearerAuth")
public class PublicUserProfileController {

    private final UserProfileService service;

    public PublicUserProfileController(UserProfileService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user's public profile",
               description = "Returns public profile info including follower/following counts and isFollowing relative to the caller.")
    public ResponseEntity<ApiResponse<PublicUserProfileResponse>> getPublicProfile(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getPublicProfile(jwt, id)));
    }
}
