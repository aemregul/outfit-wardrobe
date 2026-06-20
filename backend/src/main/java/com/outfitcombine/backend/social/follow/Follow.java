package com.outfitcombine.backend.social.follow;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "follows")
public class Follow {

    @EmbeddedId
    private FollowId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Follow() {}

    public Follow(FollowId id) { this.id = id; }

    public FollowId getId() { return id; }
    public void setId(FollowId id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
