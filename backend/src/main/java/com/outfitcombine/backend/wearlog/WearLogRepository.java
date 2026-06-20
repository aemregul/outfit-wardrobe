package com.outfitcombine.backend.wearlog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WearLogRepository extends JpaRepository<WearLog, UUID>, JpaSpecificationExecutor<WearLog> {

    Page<WearLog> findByUserIdOrderByWornAtDesc(UUID userId, Pageable pageable);

    Page<WearLog> findByUserIdAndOutfitIdOrderByWornAtDesc(UUID userId, UUID outfitId, Pageable pageable);

    Optional<WearLog> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
