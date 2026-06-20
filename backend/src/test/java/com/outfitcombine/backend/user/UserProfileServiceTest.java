package com.outfitcombine.backend.user;

import com.outfitcombine.backend.common.exception.ResourceNotFoundException;
import com.outfitcombine.backend.social.follow.FollowId;
import com.outfitcombine.backend.social.follow.FollowRepository;
import com.outfitcombine.backend.user.dto.PublicUserProfileResponse;
import com.outfitcombine.backend.user.dto.UserProfileRequest;
import com.outfitcombine.backend.user.dto.UserProfileResponse;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserProfileRepository repository;

    @Mock
    private UserProfileMapper mapper;

    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private UserProfileService service;

    private Jwt jwt;
    private UserProfile existingProfile;

    @BeforeEach
    void setUp() {
        jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", "keycloak-user-123")
                .claim("email", "test@example.com")
                .claim("preferred_username", "testuser")
                .claim("given_name", "Test")
                .claim("family_name", "User")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        existingProfile = new UserProfile();
        existingProfile.setKeycloakUserId("keycloak-user-123");
        existingProfile.setEmail("test@example.com");
        existingProfile.setUsername("testuser");
        existingProfile.setDisplayName("Test User");
    }

    @Test
    void getOrCreateCurrentUser_returnsExistingProfile() {
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        UserProfileResponse mockResponse = mock(UserProfileResponse.class);
        when(mapper.toResponse(existingProfile)).thenReturn(mockResponse);

        UserProfileResponse result = service.getOrCreateCurrentUser(jwt);

        assertThat(result).isEqualTo(mockResponse);
        verify(repository, never()).save(any());
    }

    @Test
    void getOrCreateCurrentUser_createsNewProfileOnFirstLogin() {
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.empty());
        when(repository.existsByUsername("testuser")).thenReturn(false);
        when(repository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));
        UserProfileResponse mockResponse = mock(UserProfileResponse.class);
        when(mapper.toResponse(any(UserProfile.class))).thenReturn(mockResponse);

        UserProfileResponse result = service.getOrCreateCurrentUser(jwt);

        assertThat(result).isEqualTo(mockResponse);
        verify(repository).save(any(UserProfile.class));
    }

    @Test
    void updateCurrentUser_updatesExistingProfile() {
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.existsByUsername("newusername")).thenReturn(false);
        when(repository.save(any(UserProfile.class))).thenReturn(existingProfile);
        UserProfileResponse mockResponse = mock(UserProfileResponse.class);
        when(mapper.toResponse(existingProfile)).thenReturn(mockResponse);

        UserProfileRequest request = new UserProfileRequest(
                "newusername", "New Name", "My bio", null, "MALE", new String[]{"CASUAL"}, false);

        UserProfileResponse result = service.updateCurrentUser(jwt, request);

        assertThat(result).isEqualTo(mockResponse);
        assertThat(existingProfile.getUsername()).isEqualTo("newusername");
        assertThat(existingProfile.getBio()).isEqualTo("My bio");
    }

    @Test
    void updateCurrentUser_updatesProfileImageUrl() {
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.save(any(UserProfile.class))).thenReturn(existingProfile);
        when(mapper.toResponse(existingProfile)).thenReturn(mock(UserProfileResponse.class));

        String imageUrl = "http://localhost:9000/outfit-combine/profiles/user-1/avatar.jpg";
        // username unchanged → existsByUsername not called
        UserProfileRequest request = new UserProfileRequest(
                "testuser", "Test User", null, imageUrl, null, null, false);

        service.updateCurrentUser(jwt, request);

        assertThat(existingProfile.getProfileImageUrl()).isEqualTo(imageUrl);
    }

    @Test
    void updateCurrentUser_clearsProfileImageUrlWhenNull() {
        existingProfile.setProfileImageUrl("http://old-url.com/img.jpg");
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.save(any(UserProfile.class))).thenReturn(existingProfile);
        when(mapper.toResponse(existingProfile)).thenReturn(mock(UserProfileResponse.class));

        // null profileImageUrl → should clear the stored value
        UserProfileRequest request = new UserProfileRequest(
                "testuser", "Test User", null, null, null, null, false);

        service.updateCurrentUser(jwt, request);

        assertThat(existingProfile.getProfileImageUrl()).isNull();
    }

    @Test
    void updateCurrentUser_throwsWhenUsernameAlreadyTaken() {
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.existsByUsername("taken")).thenReturn(true);

        UserProfileRequest request = new UserProfileRequest(
                "taken", "Name", null, null, null, null, false);

        assertThatThrownBy(() -> service.updateCurrentUser(jwt, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void updateCurrentUser_throwsWhenProfileNotFound() {
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.empty());

        UserProfileRequest request = new UserProfileRequest(
                "username", null, null, null, null, null, false);

        assertThatThrownBy(() -> service.updateCurrentUser(jwt, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getPublicProfile_returnsFollowerAndFollowingCounts() {
        UUID targetId = UUID.randomUUID();
        UserProfile target = new UserProfile();
        target.setUsername("targetuser");
        target.setDisplayName("Target User");

        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.findById(targetId)).thenReturn(Optional.of(target));
        when(followRepository.countByIdFollowingId(targetId)).thenReturn(42L);
        when(followRepository.countByIdFollowerId(targetId)).thenReturn(7L);
        when(followRepository.existsById(any(FollowId.class))).thenReturn(false);

        PublicUserProfileResponse result = service.getPublicProfile(jwt, targetId);

        assertThat(result.followerCount()).isEqualTo(42L);
        assertThat(result.followingCount()).isEqualTo(7L);
        assertThat(result.username()).isEqualTo("targetuser");
    }

    @Test
    void getPublicProfile_isFollowingTrueWhenFollowExists() {
        UUID targetId = UUID.randomUUID();
        UserProfile target = new UserProfile();
        target.setUsername("targetuser");

        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.findById(targetId)).thenReturn(Optional.of(target));
        when(followRepository.countByIdFollowingId(any())).thenReturn(0L);
        when(followRepository.countByIdFollowerId(any())).thenReturn(0L);
        when(followRepository.existsById(any(FollowId.class))).thenReturn(true);

        PublicUserProfileResponse result = service.getPublicProfile(jwt, targetId);

        assertThat(result.isFollowing()).isTrue();
    }

    @Test
    void getPublicProfile_throwsWhenTargetNotFound() {
        UUID targetId = UUID.randomUUID();
        when(repository.findByKeycloakUserId("keycloak-user-123")).thenReturn(Optional.of(existingProfile));
        when(repository.findById(targetId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublicProfile(jwt, targetId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
