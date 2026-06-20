package com.outfitcombine.backend.user;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.social.follow.FollowId;
import com.outfitcombine.backend.social.follow.FollowRepository;
import com.outfitcombine.backend.user.dto.PublicUserProfileResponse;
import com.outfitcombine.backend.user.dto.UserProfileRequest;
import com.outfitcombine.backend.user.dto.UserProfileResponse;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserProfileRepository repository;
    private final UserProfileMapper mapper;
    private final FollowRepository followRepository;

    public UserProfileService(UserProfileRepository repository,
                              UserProfileMapper mapper,
                              FollowRepository followRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.followRepository = followRepository;
    }

    /**
     * Returns the profile of the authenticated user.
     * Auto-creates on first login using JWT claims from Keycloak.
     */
    @Transactional
    public UserProfileResponse getOrCreateCurrentUser(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();

        return repository.findByKeycloakUserId(keycloakUserId)
                .map(mapper::toResponse)
                .orElseGet(() -> mapper.toResponse(createFromJwt(jwt)));
    }

    @Transactional
    public UserProfileResponse updateCurrentUser(Jwt jwt, UserProfileRequest request) {
        String keycloakUserId = jwt.getSubject();

        UserProfile profile = repository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "keycloakUserId", keycloakUserId));

        if (!profile.getUsername().equals(request.username()) && repository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken: " + request.username());
        }

        profile.setUsername(request.username());
        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        profile.setProfileImageUrl(request.profileImageUrl());
        profile.setGender(request.gender());
        profile.setStylePreferences(request.stylePreferences());
        profile.setPrivate(request.isPrivate());

        return mapper.toResponse(repository.save(profile));
    }

    private UserProfile createFromJwt(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String preferredUsername = jwt.getClaimAsString("preferred_username");
        String givenName = jwt.getClaimAsString("given_name");
        String familyName = jwt.getClaimAsString("family_name");

        UserProfile profile = new UserProfile();
        profile.setKeycloakUserId(keycloakUserId);
        profile.setEmail(email != null ? email : keycloakUserId + "@placeholder.local");
        profile.setUsername(resolveUniqueUsername(preferredUsername, keycloakUserId));
        profile.setDisplayName(buildDisplayName(givenName, familyName, preferredUsername));

        return repository.save(profile);
    }

    private String resolveUniqueUsername(String preferred, String fallback) {
        if (preferred != null && !preferred.isBlank() && !repository.existsByUsername(preferred)) {
            return preferred;
        }
        String base = preferred != null && !preferred.isBlank() ? preferred : "user";
        String candidate = base + "_" + fallback.substring(0, Math.min(8, fallback.length()));
        return candidate;
    }

    public PublicUserProfileResponse getPublicProfile(Jwt jwt, UUID targetId) {
        String keycloakUserId = jwt.getSubject();
        UUID currentUserId = repository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first."))
                .getId();

        UserProfile target = repository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", targetId));

        long followerCount = followRepository.countByIdFollowingId(targetId);
        long followingCount = followRepository.countByIdFollowerId(targetId);
        boolean isFollowing = followRepository.existsById(new FollowId(currentUserId, targetId));

        return new PublicUserProfileResponse(
                target.getId(),
                target.getUsername(),
                target.getDisplayName(),
                target.getBio(),
                target.getProfileImageUrl(),
                followerCount,
                followingCount,
                isFollowing,
                target.isPrivate()
        );
    }

    private String buildDisplayName(String given, String family, String username) {
        if (given != null && family != null) return given + " " + family;
        if (given != null) return given;
        return username;
    }
}
