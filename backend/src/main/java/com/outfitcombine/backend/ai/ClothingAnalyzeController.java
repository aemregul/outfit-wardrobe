package com.outfitcombine.backend.ai;

import com.outfitcombine.backend.ai.dto.ClothingAnalysisResult;
import com.outfitcombine.backend.common.ratelimit.AiRateLimited;
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
@RequestMapping("/api/v1/clothing")
@Tag(name = "Clothing — AI Analysis", description = "AI-powered clothing image analysis")
@SecurityRequirement(name = "bearerAuth")
public class ClothingAnalyzeController {

    private final AiService aiService;

    public ClothingAnalyzeController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/analyze")
    @AiRateLimited
    @Operation(summary = "Analyze a clothing image and return metadata suggestions")
    public ResponseEntity<ApiResponse<ClothingAnalysisResult>> analyze(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ClothingAnalyzeRequest request) {
        ClothingAnalysisResult result = aiService.analyzeClothing(request.imageUrl());
        return ResponseEntity.ok(ApiResponse.success("Analysis complete", result));
    }
}
