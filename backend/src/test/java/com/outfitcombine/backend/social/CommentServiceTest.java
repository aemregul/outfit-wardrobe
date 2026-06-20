package com.outfitcombine.backend.social;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.social.comment.Comment;
import com.outfitcombine.backend.social.comment.CommentMapper;
import com.outfitcombine.backend.social.comment.CommentRepository;
import com.outfitcombine.backend.social.comment.CommentService;
import com.outfitcombine.backend.social.comment.dto.CommentRequest;
import com.outfitcombine.backend.social.comment.dto.CommentResponse;
import com.outfitcombine.backend.social.post.PostRepository;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock private CommentRepository commentRepository;
    @Mock private PostRepository postRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private CommentMapper mapper;

    @InjectMocks
    private CommentService service;

    private Jwt jwt;
    private UserProfile userProfile;
    private UUID postId;
    private UUID commentId;

    @BeforeEach
    void setUp() {
        postId    = UUID.randomUUID();
        commentId = UUID.randomUUID();

        jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", "keycloak-user-123")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        userProfile = new UserProfile();
        userProfile.setKeycloakUserId("keycloak-user-123");
        userProfile.setUsername("tester");
        userProfile.setDisplayName("Tester T");
    }

    // --- addComment ---

    @Test
    void addComment_savesCommentAndIncrementsCount() {
        Comment saved = new Comment();
        saved.setPostId(postId);
        saved.setContent("hello");

        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.existsById(postId)).thenReturn(true);
        when(commentRepository.save(any())).thenReturn(saved);
        when(mapper.toResponse(any(), any(), any())).thenReturn(mock(CommentResponse.class));

        service.addComment(jwt, postId, new CommentRequest("hello"));

        verify(commentRepository).save(any(Comment.class));
        verify(postRepository).incrementCommentsCount(postId);
    }

    @Test
    void addComment_throwsWhenPostNotFound() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.existsById(postId)).thenReturn(false);

        assertThatThrownBy(() -> service.addComment(jwt, postId, new CommentRequest("hello")))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).save(any());
        verify(postRepository, never()).incrementCommentsCount(any());
    }

    @Test
    void addComment_passesUsernameAndDisplayNameToMapper() {
        Comment saved = new Comment();
        saved.setPostId(postId);
        saved.setContent("hi");

        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.existsById(postId)).thenReturn(true);
        when(commentRepository.save(any())).thenReturn(saved);
        when(mapper.toResponse(any(), any(), any())).thenReturn(mock(CommentResponse.class));

        service.addComment(jwt, postId, new CommentRequest("hi"));

        verify(mapper).toResponse(any(), eq("tester"), eq("Tester T"));
    }

    // --- deleteComment ---

    @Test
    void deleteComment_deletesCommentAndDecrementsCount() {
        Comment comment = new Comment();
        comment.setPostId(postId);

        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(commentRepository.findByIdAndUserId(commentId, userProfile.getId())).thenReturn(Optional.of(comment));

        service.deleteComment(jwt, commentId);

        verify(commentRepository).delete(comment);
        verify(postRepository).decrementCommentsCount(postId);
    }

    @Test
    void deleteComment_throwsWhenNotOwner() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(commentRepository.findByIdAndUserId(commentId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteComment(jwt, commentId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(commentRepository, never()).delete(any());
        verify(postRepository, never()).decrementCommentsCount(any());
    }
}
