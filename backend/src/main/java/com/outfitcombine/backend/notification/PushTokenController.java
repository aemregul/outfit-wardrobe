package com.outfitcombine.backend.notification;

import com.outfitcombine.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Push notification token registration")
@SecurityRequirement(name = "bearerAuth")
public class PushTokenController {

    private final PushTokenService pushTokenService;

    public PushTokenController(PushTokenService pushTokenService) {
        this.pushTokenService = pushTokenService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register or update push notification token")
    public ResponseEntity<ApiResponse<Void>> register(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PushTokenRequest request) {
        pushTokenService.registerToken(jwt, request);
        return ResponseEntity.ok(ApiResponse.success("Token registered", null));
    }
}
