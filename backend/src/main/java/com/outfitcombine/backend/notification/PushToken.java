package com.outfitcombine.backend.notification;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "push_tokens",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "platform"}))
public class PushToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;

    @Column(nullable = false, length = 10)
    private String platform;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PushToken() {}

    public PushToken(UUID userId, String token, String platform) {
        this.userId = userId;
        this.token = token;
        this.platform = platform;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getToken() { return token; }
    public String getPlatform() { return platform; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setUserId(UUID userId) { this.userId = userId; }
    public void setToken(String token) { this.token = token; }
    public void setPlatform(String platform) { this.platform = platform; }
}
