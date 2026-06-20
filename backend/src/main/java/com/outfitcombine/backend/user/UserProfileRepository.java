package com.outfitcombine.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByKeycloakUserId(String keycloakUserId);
    Optional<UserProfile> findByUsername(String username);
    Optional<UserProfile> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
