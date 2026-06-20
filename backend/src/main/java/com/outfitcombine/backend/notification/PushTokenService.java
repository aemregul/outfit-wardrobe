package com.outfitcombine.backend.notification;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.user.UserProfile;
import com.outfitcombine.backend.user.UserProfileRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class PushTokenService {

    private final PushTokenRepository pushTokenRepository;
    private final UserProfileRepository userProfileRepository;

    public PushTokenService(PushTokenRepository pushTokenRepository,
                            UserProfileRepository userProfileRepository) {
        this.pushTokenRepository = pushTokenRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public void registerToken(Jwt jwt, PushTokenRequest request) {
        UUID userId = resolveUserId(jwt);

        pushTokenRepository.findByUserIdAndPlatform(userId, request.platform())
                .ifPresentOrElse(
                        existing -> existing.setToken(request.token()),
                        () -> pushTokenRepository.save(
                                new PushToken(userId, request.token(), request.platform()))
                );
    }

    private UUID resolveUserId(Jwt jwt) {
        String keycloakUserId = jwt.getSubject();
        UserProfile profile = userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found. Call GET /api/v1/me first."));
        return profile.getId();
    }
}
