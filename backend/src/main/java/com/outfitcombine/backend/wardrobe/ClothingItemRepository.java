package com.outfitcombine.backend.wardrobe;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClothingItemRepository extends JpaRepository<ClothingItem, UUID> {

    @Query(value = """
            SELECT * FROM clothing_items
            WHERE user_id = :userId
              AND (CAST(:category AS TEXT) IS NULL OR category = :category)
              AND (:isClean IS NULL OR is_clean = :isClean)
              AND (CAST(:season AS TEXT) IS NULL OR :season = ANY(seasons))
              AND (CAST(:style AS TEXT) IS NULL OR :style = ANY(styles))
            """,
            countQuery = """
            SELECT COUNT(*) FROM clothing_items
            WHERE user_id = :userId
              AND (CAST(:category AS TEXT) IS NULL OR category = :category)
              AND (:isClean IS NULL OR is_clean = :isClean)
              AND (CAST(:season AS TEXT) IS NULL OR :season = ANY(seasons))
              AND (CAST(:style AS TEXT) IS NULL OR :style = ANY(styles))
            """,
            nativeQuery = true)
    Page<ClothingItem> findFiltered(@Param("userId") UUID userId,
                                     @Param("category") String category,
                                     @Param("isClean") Boolean isClean,
                                     @Param("season") String season,
                                     @Param("style") String style,
                                     Pageable pageable);

    Optional<ClothingItem> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
