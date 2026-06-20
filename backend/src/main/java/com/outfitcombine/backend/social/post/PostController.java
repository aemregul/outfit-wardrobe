package com.outfitcombine.backend.social.post;

import com.outfitcombine.backend.common.response.ApiResponse;
import com.outfitcombine.backend.social.comment.CommentService;
import com.outfitcombine.backend.social.comment.dto.CommentRequest;
import com.outfitcombine.backend.social.comment.dto.CommentResponse;
import com.outfitcombine.backend.social.post.dto.PostRequest;
import com.outfitcombine.backend.social.post.dto.PostResponse;
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
@Tag(name = "Social — Posts", description = "Create, view, like and comment on posts")
@SecurityRequirement(name = "bearerAuth")
public class PostController {

    private final PostService postService;
    private final CommentService commentService;

    public PostController(PostService postService, CommentService commentService) {
        this.postService = postService;
        this.commentService = commentService;
    }

    // --- Feed ---

    @GetMapping("/api/v1/feed")
    @Operation(summary = "Get social feed",
               description = "Returns PUBLIC posts + FOLLOWERS posts from followed users + own posts.")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getFeed(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(postService.getFeed(jwt, pageable)));
    }

    // --- Explore ---

    @GetMapping("/api/v1/posts/explore")
    @Operation(summary = "Explore all public posts",
               description = "Returns all PUBLIC posts from all users, sorted by newest first.")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getExplore(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(postService.getExplore(jwt, pageable)));
    }

    // --- Posts CRUD ---

    @PostMapping("/api/v1/posts")
    @Operation(summary = "Create a post")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PostRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post created", postService.createPost(jwt, request)));
    }

    @GetMapping("/api/v1/posts/{id}")
    @Operation(summary = "Get post by ID", description = "Respects visibility rules.")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(postService.getPost(jwt, id)));
    }

    @DeleteMapping("/api/v1/posts/{id}")
    @Operation(summary = "Delete own post")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        postService.deletePost(jwt, id);
        return ResponseEntity.noContent().build();
    }

    // --- Likes ---

    @PostMapping("/api/v1/posts/{id}/like")
    @Operation(summary = "Like a post")
    public ResponseEntity<ApiResponse<PostResponse>> likePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Post liked", postService.likePost(jwt, id)));
    }

    @DeleteMapping("/api/v1/posts/{id}/like")
    @Operation(summary = "Unlike a post")
    public ResponseEntity<ApiResponse<PostResponse>> unlikePost(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Post unliked", postService.unlikePost(jwt, id)));
    }

    // --- Comments ---

    @PostMapping("/api/v1/posts/{id}/comments")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", commentService.addComment(jwt, id, request)));
    }

    @GetMapping("/api/v1/posts/{id}/comments")
    @Operation(summary = "List comments on a post")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> listComments(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(commentService.listComments(id, pageable)));
    }
}
