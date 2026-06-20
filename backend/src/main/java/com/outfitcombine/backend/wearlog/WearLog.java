package com.outfitcombine.backend.wearlog;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wear_logs")
public class WearLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "outfit_id", nullable = false)
    private UUID outfitId;

    @Column(name = "worn_at", nullable = false)
    private LocalDateTime wornAt;

    @Column(length = 255)
    private String location;

    @Column(length = 255)
    private String occasion;

    @Column
    private Integer rating;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "would_wear_again")
    private Boolean wouldWearAgain;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getOutfitId() { return outfitId; }
    public void setOutfitId(UUID outfitId) { this.outfitId = outfitId; }
    public LocalDateTime getWornAt() { return wornAt; }
    public void setWornAt(LocalDateTime wornAt) { this.wornAt = wornAt; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getOccasion() { return occasion; }
    public void setOccasion(String occasion) { this.occasion = occasion; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Boolean getWouldWearAgain() { return wouldWearAgain; }
    public void setWouldWearAgain(Boolean wouldWearAgain) { this.wouldWearAgain = wouldWearAgain; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
