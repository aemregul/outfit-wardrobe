package com.outfitcombine.backend.social.follow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FollowRepository extends JpaRepository<Follow, FollowId> {

    @Query("SELECT f.id.followingId FROM Follow f WHERE f.id.followerId = :followerId")
    List<UUID> findFollowingIds(UUID followerId);

    @Query("SELECT f.id.followerId FROM Follow f WHERE f.id.followingId = :followingId")
    List<UUID> findFollowerIds(UUID followingId);

    long countByIdFollowerId(UUID followerId);

    long countByIdFollowingId(UUID followingId);
}
