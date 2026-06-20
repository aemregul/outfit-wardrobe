package com.outfitcombine.backend.social.comment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponse(
        UUID id,
        UUID postId,
        UUID userId,
        String username,
        String displayName,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
