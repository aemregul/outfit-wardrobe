package com.outfitcombine.backend.social.follow;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final UserProfileRepository userProfileRepository;

    public FollowService(FollowRepository followRepository, UserProfileRepository userProfileRepository) {
        this.followRepository = followRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public void follow(Jwt jwt, UUID targetUserId) {
        UUID currentUserId = resolveUserId(jwt);

        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot follow yourself.");
        }

        if (!userProfileRepository.existsById(targetUserId)) {
            throw new ResourceNotFoundException("UserProfile", "id", targetUserId);
        }

        FollowId id = new FollowId(currentUserId, targetUserId);
        if (followRepository.existsById(id)) {
            throw new IllegalArgumentException("Already following this user.");
        }

        followRepository.save(new Follow(id));
    }

    @Transactional
    public void unfollow(Jwt jwt, UUID targetUserId) {
        UUID currentUserId = resolveUserId(jwt);
        FollowId id = new FollowId(currentUserId, targetUserId);

        if (!followRepository.existsById(id)) {
            throw new IllegalArgumentException("Not following this user.");
        }

        followRepository.deleteById(id);
    }

    public boolean isFollowing(Jwt jwt, UUID targetUserId) {
        UUID currentUserId = resolveUserId(jwt);
        return followRepository.existsById(new FollowId(currentUserId, targetUserId));
    }

    private UUID resolveUserId(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        UserProfile profile = userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first."));
        return profile.getId();
    }
}
