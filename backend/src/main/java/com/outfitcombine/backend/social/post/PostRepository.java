package com.outfitcombine.backend.social.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /**
     * Feed: PUBLIC posts + FOLLOWERS posts where current user follows author + own posts.
     */
    @Query("""
            SELECT p FROM Post p WHERE
                p.userId = :userId
                OR p.visibility = com.outfitcombine.backend.social.enums.Visibility.PUBLIC
                OR (p.visibility = com.outfitcombine.backend.social.enums.Visibility.FOLLOWERS
                    AND p.userId IN (
                        SELECT f.id.followingId FROM Follow f WHERE f.id.followerId = :userId
                    ))
            """)
    Page<Post> findFeed(UUID userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.visibility = com.outfitcombine.backend.social.enums.Visibility.PUBLIC")
    Page<Post> findAllPublic(Pageable pageable);

    Optional<Post> findByIdAndUserId(UUID id, UUID userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.id = :postId")
    void incrementLikesCount(UUID postId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.id = :postId AND p.likesCount > 0")
    void decrementLikesCount(UUID postId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + 1 WHERE p.id = :postId")
    void incrementCommentsCount(UUID postId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount - 1 WHERE p.id = :postId AND p.commentsCount > 0")
    void decrementCommentsCount(UUID postId);
}
