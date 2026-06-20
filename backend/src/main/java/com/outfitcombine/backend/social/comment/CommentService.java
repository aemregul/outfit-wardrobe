package com.outfitcombine.backend.social.comment;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.social.comment.dto.CommentRequest;
import com.outfitcombine.backend.social.comment.dto.CommentResponse;
import com.outfitcombine.backend.social.post.PostRepository;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserProfileRepository userProfileRepository;
    private final CommentMapper mapper;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          UserProfileRepository userProfileRepository,
                          CommentMapper mapper) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userProfileRepository = userProfileRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CommentResponse addComment(Jwt jwt, UUID postId, CommentRequest request) {
        UserProfile commenter = resolveUserProfile(jwt);
        UUID userId = commenter.getId();

        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(request.content());

        Comment saved = commentRepository.save(comment);
        postRepository.incrementCommentsCount(postId);

        return mapper.toResponse(saved, commenter.getUsername(), commenter.getDisplayName());
    }

    public Page<CommentResponse> listComments(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        Page<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId, pageable);

        Set<UUID> authorIds = comments.stream().map(Comment::getUserId).collect(Collectors.toSet());
        Map<UUID, UserProfile> profileMap = userProfileRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(UserProfile::getId, p -> p));

        return comments.map(comment -> {
            UserProfile author = profileMap.get(comment.getUserId());
            return mapper.toResponse(comment,
                    author != null ? author.getUsername() : null,
                    author != null ? author.getDisplayName() : null);
        });
    }

    @Transactional
    public void deleteComment(Jwt jwt, UUID commentId) {
        UUID userId = resolveUserId(jwt);
        Comment comment = commentRepository.findByIdAndUserId(commentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        UUID postId = comment.getPostId();
        commentRepository.delete(comment);
        postRepository.decrementCommentsCount(postId);
    }

    private UserProfile resolveUserProfile(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        return userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first."));
    }

    private UUID resolveUserId(Jwt jwt) {
        return resolveUserProfile(jwt).getId();
    }
}
