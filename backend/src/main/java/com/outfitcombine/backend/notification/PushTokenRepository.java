package com.outfitcombine.backend.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PushTokenRepository extends JpaRepository<PushToken, UUID> {

    Optional<PushToken> findByUserIdAndPlatform(UUID userId, String platform);

    List<PushToken> findAllByUserId(UUID userId);
}
