package com.outfitcombine.backend.social.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "Comment content is required")
        @Size(max = 1000, message = "Comment too long")
        String content
) {}
