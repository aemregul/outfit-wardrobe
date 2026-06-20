package com.outfitcombine.backend.social.post;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.social.enums.Visibility;
import com.outfitcombine.backend.social.follow.FollowId;
import com.outfitcombine.backend.social.follow.FollowRepository;
import com.outfitcombine.backend.social.like.PostLike;
import com.outfitcombine.backend.social.like.PostLikeId;
import com.outfitcombine.backend.social.like.PostLikeRepository;
import com.outfitcombine.backend.social.post.dto.PostRequest;
import com.outfitcombine.backend.social.post.dto.PostResponse;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final FollowRepository followRepository;
    private final UserProfileRepository userProfileRepository;
    private final PostMapper mapper;

    public PostService(PostRepository postRepository,
                       PostLikeRepository postLikeRepository,
                       FollowRepository followRepository,
                       UserProfileRepository userProfileRepository,
                       PostMapper mapper) {
        this.postRepository = postRepository;
        this.postLikeRepository = postLikeRepository;
        this.followRepository = followRepository;
        this.userProfileRepository = userProfileRepository;
        this.mapper = mapper;
    }

    @Transactional
    public PostResponse createPost(Jwt jwt, PostRequest request) {
        UserProfile currentUser = resolveUserProfile(jwt);
        UUID userId = currentUser.getId();

        Post post = new Post();
        post.setUserId(userId);
        post.setImageUrl(request.imageUrl());
        post.setCaption(request.caption());
        post.setOutfitId(request.outfitId());
        post.setVisibility(request.visibility() != null ? request.visibility() : Visibility.PUBLIC);

        Post saved = postRepository.save(post);
        return mapper.toResponse(saved, userId, false, currentUser.getUsername(), currentUser.getDisplayName());
    }

    public Page<PostResponse> getFeed(Jwt jwt, Pageable pageable) {
        UUID userId = resolveUserId(jwt);
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending());

        Page<Post> posts = postRepository.findFeed(userId, sorted);

        Set<UUID> authorIds = posts.stream().map(Post::getUserId).collect(Collectors.toSet());
        Map<UUID, UserProfile> profileMap = loadProfiles(authorIds);

        return posts.map(post -> {
            boolean liked = postLikeRepository.existsById(new PostLikeId(post.getId(), userId));
            UserProfile author = profileMap.get(post.getUserId());
            return mapper.toResponse(post, userId, liked,
                    author != null ? author.getUsername() : null,
                    author != null ? author.getDisplayName() : null);
        });
    }

    public Page<PostResponse> getExplore(Jwt jwt, Pageable pageable) {
        UUID userId = resolveUserId(jwt);
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("createdAt").descending());

        Page<Post> posts = postRepository.findAllPublic(sorted);

        Set<UUID> authorIds = posts.stream().map(Post::getUserId).collect(Collectors.toSet());
        Map<UUID, UserProfile> profileMap = loadProfiles(authorIds);

        return posts.map(post -> {
            boolean liked = postLikeRepository.existsById(new PostLikeId(post.getId(), userId));
            UserProfile author = profileMap.get(post.getUserId());
            return mapper.toResponse(post, userId, liked,
                    author != null ? author.getUsername() : null,
                    author != null ? author.getDisplayName() : null);
        });
    }

    public PostResponse getPost(Jwt jwt, UUID postId) {
        UUID userId = resolveUserId(jwt);
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!canSee(userId, post)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }

        boolean liked = postLikeRepository.existsById(new PostLikeId(postId, userId));
        UserProfile author = userProfileRepository.findById(post.getUserId()).orElse(null);
        return mapper.toResponse(post, userId, liked,
                author != null ? author.getUsername() : null,
                author != null ? author.getDisplayName() : null);
    }

    @Transactional
    public void deletePost(Jwt jwt, UUID postId) {
        UUID userId = resolveUserId(jwt);
        Post post = postRepository.findByIdAndUserId(postId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        postRepository.delete(post);
    }

    @Transactional
    public PostResponse likePost(Jwt jwt, UUID postId) {
        UUID userId = resolveUserId(jwt);
        findVisiblePost(userId, postId);

        PostLikeId likeId = new PostLikeId(postId, userId);
        if (postLikeRepository.existsById(likeId)) {
            throw new IllegalArgumentException("Post already liked.");
        }

        postLikeRepository.save(new PostLike(likeId));
        postRepository.incrementLikesCount(postId);

        Post refreshed = postRepository.findById(postId).orElseThrow();
        UserProfile author = userProfileRepository.findById(refreshed.getUserId()).orElse(null);
        return mapper.toResponse(refreshed, userId, true,
                author != null ? author.getUsername() : null,
                author != null ? author.getDisplayName() : null);
    }

    @Transactional
    public PostResponse unlikePost(Jwt jwt, UUID postId) {
        UUID userId = resolveUserId(jwt);
        findVisiblePost(userId, postId);

        PostLikeId likeId = new PostLikeId(postId, userId);
        if (!postLikeRepository.existsById(likeId)) {
            throw new IllegalArgumentException("Post not liked.");
        }

        postLikeRepository.deleteById(likeId);
        postRepository.decrementLikesCount(postId);

        Post refreshed = postRepository.findById(postId).orElseThrow();
        UserProfile author = userProfileRepository.findById(refreshed.getUserId()).orElse(null);
        return mapper.toResponse(refreshed, userId, false,
                author != null ? author.getUsername() : null,
                author != null ? author.getDisplayName() : null);
    }

    // --- private helpers ---

    private Post findVisiblePost(UUID userId, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        if (!canSee(userId, post)) {
            throw new ResourceNotFoundException("Post", "id", postId);
        }
        return post;
    }

    private boolean canSee(UUID viewerId, Post post) {
        if (post.getUserId().equals(viewerId)) return true;
        return switch (post.getVisibility()) {
            case PUBLIC -> true;
            case FOLLOWERS -> followRepository.existsById(new FollowId(viewerId, post.getUserId()));
            case PRIVATE -> false;
        };
    }

    private Map<UUID, UserProfile> loadProfiles(Collection<UUID> ids) {
        return userProfileRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(UserProfile::getId, p -> p));
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
