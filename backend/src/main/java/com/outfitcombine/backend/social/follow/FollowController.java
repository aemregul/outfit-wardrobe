package com.outfitcombine.backend.social.follow;

import com.outfitcombine.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Social — Follow", description = "Follow and unfollow users")
@SecurityRequirement(name = "bearerAuth")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{userId}/follow")
    @Operation(summary = "Follow a user")
    public ResponseEntity<ApiResponse<Void>> follow(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId) {
        followService.follow(jwt, userId);
        return ResponseEntity.ok(ApiResponse.success("Followed successfully", null));
    }

    @DeleteMapping("/{userId}/follow")
    @Operation(summary = "Unfollow a user")
    public ResponseEntity<ApiResponse<Void>> unfollow(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId) {
        followService.unfollow(jwt, userId);
        return ResponseEntity.ok(ApiResponse.success("Unfollowed successfully", null));
    }
}
