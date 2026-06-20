package com.outfitcombine.backend.user;

import com.outfitcombine.backend.user.dto.UserProfileResponse;
import org.springframework.stereotype.Component;

@Component
public class UserProfileMapper {

    public UserProfileResponse toResponse(UserProfile profile) {
        return new UserProfileResponse(
                profile.getId(),
                profile.getKeycloakUserId(),
                profile.getEmail(),
                profile.getUsername(),
                profile.getDisplayName(),
                profile.getProfileImageUrl(),
                profile.getBio(),
                profile.getGender(),
                profile.getStylePreferences(),
                profile.isPrivate(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
