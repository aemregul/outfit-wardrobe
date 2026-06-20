package com.outfitcombine.backend.social.comment;

import com.outfitcombine.backend.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
@Tag(name = "Social — Comments", description = "Delete comments")
@SecurityRequirement(name = "bearerAuth")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete own comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        commentService.deleteComment(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}
