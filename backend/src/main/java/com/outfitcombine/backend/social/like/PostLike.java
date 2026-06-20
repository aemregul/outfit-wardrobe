package com.outfitcombine.backend.social.like;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_likes")
public class PostLike {

    @EmbeddedId
    private PostLikeId id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public PostLike() {}

    public PostLike(PostLikeId id) { this.id = id; }

    public PostLikeId getId() { return id; }
    public void setId(PostLikeId id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
