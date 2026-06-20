package com.outfitcombine.backend.social;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.social.enums.Visibility;
import com.outfitcombine.backend.social.follow.FollowId;
import com.outfitcombine.backend.social.follow.FollowRepository;
import com.outfitcombine.backend.social.like.PostLikeId;
import com.outfitcombine.backend.social.like.PostLikeRepository;
import com.outfitcombine.backend.social.post.Post;
import com.outfitcombine.backend.social.post.PostMapper;
import com.outfitcombine.backend.social.post.PostRepository;
import com.outfitcombine.backend.social.post.PostService;
import com.outfitcombine.backend.social.post.dto.PostRequest;
import com.outfitcombine.backend.social.post.dto.PostResponse;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock private PostRepository postRepository;
    @Mock private PostLikeRepository postLikeRepository;
    @Mock private FollowRepository followRepository;
    @Mock private UserProfileRepository userProfileRepository;
    @Mock private PostMapper mapper;

    @InjectMocks
    private PostService service;

    private Jwt jwt;
    private UserProfile userProfile;
    private Post publicPost;
    private Post privatePost;
    private Post followersPost;
    private UUID postId;
    private UUID authorId;

    @BeforeEach
    void setUp() {
        authorId = UUID.randomUUID();
        postId = UUID.randomUUID();

        jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", "keycloak-user-123")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        userProfile = new UserProfile();
        userProfile.setKeycloakUserId("keycloak-user-123");

        publicPost = new Post();
        publicPost.setUserId(authorId);
        publicPost.setVisibility(Visibility.PUBLIC);
        publicPost.setImageUrl("http://example.com/img.jpg");

        privatePost = new Post();
        privatePost.setUserId(authorId);
        privatePost.setVisibility(Visibility.PRIVATE);
        privatePost.setImageUrl("http://example.com/img.jpg");

        followersPost = new Post();
        followersPost.setUserId(authorId);
        followersPost.setVisibility(Visibility.FOLLOWERS);
        followersPost.setImageUrl("http://example.com/img.jpg");
    }

    @Test
    void createPost_savesAndReturnsResponse() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        PostRequest request = new PostRequest("http://img.jpg", "My outfit", null, Visibility.PUBLIC);
        service.createPost(jwt, request);

        verify(postRepository).save(any(Post.class));
    }

    @Test
    void getPost_publicPostIsAlwaysVisible() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId)).thenReturn(Optional.of(publicPost));
        when(postLikeRepository.existsById(any())).thenReturn(false);
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        service.getPost(jwt, postId);

        verify(followRepository, never()).existsById(any());
    }

    @Test
    void getPost_privatePostThrowsForOtherUser() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId)).thenReturn(Optional.of(privatePost));

        assertThatThrownBy(() -> service.getPost(jwt, postId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getPost_followersPostVisibleWhenFollowing() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId)).thenReturn(Optional.of(followersPost));
        when(followRepository.existsById(new FollowId(userProfile.getId(), authorId))).thenReturn(true);
        when(postLikeRepository.existsById(any())).thenReturn(false);
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        service.getPost(jwt, postId);

        verify(mapper).toResponse(any(), any(), anyBoolean(), any(), any());
    }

    @Test
    void likePost_throwsWhenAlreadyLiked() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId)).thenReturn(Optional.of(publicPost));
        when(postLikeRepository.existsById(new PostLikeId(postId, userProfile.getId()))).thenReturn(true);

        assertThatThrownBy(() -> service.likePost(jwt, postId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already liked");
    }

    @Test
    void likePost_responseContainsLikedTrueAndIncrementedCount() {
        Post refreshedPost = new Post();
        refreshedPost.setUserId(authorId);
        refreshedPost.setVisibility(Visibility.PUBLIC);
        refreshedPost.setLikesCount(1);

        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId))
                .thenReturn(Optional.of(publicPost))   // findVisiblePost
                .thenReturn(Optional.of(refreshedPost)); // refreshed after increment
        when(postLikeRepository.existsById(new PostLikeId(postId, userProfile.getId()))).thenReturn(false);
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        service.likePost(jwt, postId);

        verify(postRepository).incrementLikesCount(postId);
        verify(mapper).toResponse(eq(refreshedPost), any(), eq(true), any(), any());
    }

    @Test
    void unlikePost_throwsWhenNotLiked() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId)).thenReturn(Optional.of(publicPost));
        when(postLikeRepository.existsById(new PostLikeId(postId, userProfile.getId()))).thenReturn(false);

        assertThatThrownBy(() -> service.unlikePost(jwt, postId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not liked");
    }

    @Test
    void unlikePost_responseContainsLikedFalseAndDecrementedCount() {
        publicPost.setLikesCount(1);

        Post refreshedPost = new Post();
        refreshedPost.setUserId(authorId);
        refreshedPost.setVisibility(Visibility.PUBLIC);
        refreshedPost.setLikesCount(0);

        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId))
                .thenReturn(Optional.of(publicPost))   // findVisiblePost
                .thenReturn(Optional.of(refreshedPost)); // refreshed after decrement
        when(postLikeRepository.existsById(new PostLikeId(postId, userProfile.getId()))).thenReturn(true);
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        service.unlikePost(jwt, postId);

        verify(postRepository).decrementLikesCount(postId);
        verify(mapper).toResponse(eq(refreshedPost), any(), eq(false), any(), any());
    }

    @Test
    void deletePost_throwsWhenNotOwner() {
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findByIdAndUserId(postId, userProfile.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deletePost(jwt, postId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(postRepository, never()).delete(any());
    }

    @Test
    void createPost_passesUsernameAndDisplayNameToMapper() {
        userProfile.setUsername("alice");
        userProfile.setDisplayName("Alice A");
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PostRequest request = new PostRequest("http://img.jpg", "caption", null, Visibility.PUBLIC);
        service.createPost(jwt, request);

        verify(mapper).toResponse(any(), any(), eq(false), eq("alice"), eq("Alice A"));
    }

    @Test
    void getPost_passesAuthorUsernameToMapper() {
        UserProfile author = new UserProfile();
        author.setUsername("bob");
        author.setDisplayName("Bob B");

        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findById(postId)).thenReturn(Optional.of(publicPost));
        when(postLikeRepository.existsById(any())).thenReturn(false);
        when(userProfileRepository.findById(authorId)).thenReturn(Optional.of(author));
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        service.getPost(jwt, postId);

        verify(mapper).toResponse(any(), any(), anyBoolean(), eq("bob"), eq("Bob B"));
    }

    // --- getExplore ---

    @Test
    void getExplore_returnsPublicPostsWithAuthorInfo() {
        UserProfile author = new UserProfile();
        author.setUsername("carol");
        author.setDisplayName("Carol C");

        Page<Post> page = new PageImpl<>(List.of(publicPost));
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findAllPublic(any(Pageable.class))).thenReturn(page);
        when(userProfileRepository.findAllById(any())).thenReturn(List.of(author));
        when(postLikeRepository.existsById(any())).thenReturn(false);
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        Page<PostResponse> result = service.getExplore(jwt, PageRequest.of(0, 20));

        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(postRepository).findAllPublic(any(Pageable.class));
        verify(postRepository, never()).findFeed(any(), any());
    }

    @Test
    void getExplore_doesNotCallFindFeed() {
        Page<Post> emptyPage = new PageImpl<>(List.of());
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findAllPublic(any(Pageable.class))).thenReturn(emptyPage);
        when(userProfileRepository.findAllById(any())).thenReturn(List.of());

        service.getExplore(jwt, PageRequest.of(0, 20));

        verify(postRepository).findAllPublic(any(Pageable.class));
        verify(postRepository, never()).findFeed(any(), any());
    }

    @Test
    void getExplore_passesAuthorUsernameAndDisplayNameToMapper() {
        UserProfile author = new UserProfile();
        author.setUsername("dave");
        author.setDisplayName("Dave D");
        ReflectionTestUtils.setField(author, "id", authorId);

        Page<Post> page = new PageImpl<>(List.of(publicPost));
        when(userProfileRepository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(userProfile));
        when(postRepository.findAllPublic(any(Pageable.class))).thenReturn(page);
        when(userProfileRepository.findAllById(any())).thenReturn(List.of(author));
        when(postLikeRepository.existsById(any())).thenReturn(false);
        when(mapper.toResponse(any(), any(), anyBoolean(), any(), any())).thenReturn(mock(PostResponse.class));

        service.getExplore(jwt, PageRequest.of(0, 20));

        verify(mapper).toResponse(any(), any(), anyBoolean(), eq("dave"), eq("Dave D"));
    }
}
