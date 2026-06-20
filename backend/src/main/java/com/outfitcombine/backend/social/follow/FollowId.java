package com.outfitcombine.backend.social.follow;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class FollowId implements Serializable {

    @Column(name = "follower_id")
    private UUID followerId;

    @Column(name = "following_id")
    private UUID followingId;

    public FollowId() {}

    public FollowId(UUID followerId, UUID followingId) {
        this.followerId = followerId;
        this.followingId = followingId;
    }

    public UUID getFollowerId() { return followerId; }
    public UUID getFollowingId() { return followingId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FollowId that)) return false;
        return Objects.equals(followerId, that.followerId) && Objects.equals(followingId, that.followingId);
    }

    @Override
    public int hashCode() { return Objects.hash(followerId, followingId); }
}
