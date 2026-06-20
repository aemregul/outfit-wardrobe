package com.outfitcombine.backend.social.post;

import com.outfitcombine.backend.social.post.dto.PostResponse;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PostMapper {

    public PostResponse toResponse(Post post, UUID currentUserId, boolean likedByCurrentUser,
                                   String username, String displayName) {
        return new PostResponse(
                post.getId(),
                post.getUserId(),
                username,
                displayName,
                post.getOutfitId(),
                post.getImageUrl(),
                post.getCaption(),
                post.getVisibility(),
                post.getLikesCount(),
                post.getCommentsCount(),
                likedByCurrentUser,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
