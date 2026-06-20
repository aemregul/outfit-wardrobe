package com.outfitcombine.backend.outfit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, UUID> {

    @Query(value = """
            SELECT * FROM outfits
            WHERE user_id = :userId
              AND (:isFavorite IS NULL OR is_favorite = :isFavorite)
              AND (:aiGenerated IS NULL OR ai_generated = :aiGenerated)
              AND (CAST(:occasion AS TEXT) IS NULL OR :occasion = ANY(occasion))
              AND (CAST(:season AS TEXT) IS NULL OR :season = ANY(seasons))
              AND (CAST(:style AS TEXT) IS NULL OR :style = ANY(styles))
            """,
            countQuery = """
            SELECT COUNT(*) FROM outfits
            WHERE user_id = :userId
              AND (:isFavorite IS NULL OR is_favorite = :isFavorite)
              AND (:aiGenerated IS NULL OR ai_generated = :aiGenerated)
              AND (CAST(:occasion AS TEXT) IS NULL OR :occasion = ANY(occasion))
              AND (CAST(:season AS TEXT) IS NULL OR :season = ANY(seasons))
              AND (CAST(:style AS TEXT) IS NULL OR :style = ANY(styles))
            """,
            nativeQuery = true)
    Page<Outfit> findFiltered(@Param("userId") UUID userId,
                               @Param("isFavorite") Boolean isFavorite,
                               @Param("aiGenerated") Boolean aiGenerated,
                               @Param("occasion") String occasion,
                               @Param("season") String season,
                               @Param("style") String style,
                               Pageable pageable);

    @EntityGraph(attributePaths = "clothingItems")
    Optional<Outfit> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
