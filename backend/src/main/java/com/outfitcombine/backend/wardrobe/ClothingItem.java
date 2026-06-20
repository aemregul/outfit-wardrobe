package com.outfitcombine.backend.wardrobe;

import com.outfitcombine.backend.wardrobe.enums.ClothingCategory;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "clothing_items")
public class ClothingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ClothingCategory category;

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    @Column(name = "colors", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] colors;

    @Column(length = 255)
    private String brand;

    @Column(length = 50)
    private String size;

    @Column(name = "seasons", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] seasons;

    @Column(name = "styles", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] styles;

    @Column(length = 255)
    private String material;

    @Column(length = 255)
    private String pattern;

    @Column(name = "product_url")
    private String productUrl;

    @Column(name = "is_clean", nullable = false)
    private boolean isClean = true;

    @Column(name = "wear_count", nullable = false)
    private int wearCount = 0;

    @Column(name = "last_worn_at")
    private LocalDateTime lastWornAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "ai_analysis_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String aiAnalysisJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public ClothingCategory getCategory() { return category; }
    public void setCategory(ClothingCategory category) { this.category = category; }
    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }
    public String[] getColors() { return colors; }
    public void setColors(String[] colors) { this.colors = colors; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String[] getSeasons() { return seasons; }
    public void setSeasons(String[] seasons) { this.seasons = seasons; }
    public String[] getStyles() { return styles; }
    public void setStyles(String[] styles) { this.styles = styles; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getPattern() { return pattern; }
    public void setPattern(String pattern) { this.pattern = pattern; }
    public String getProductUrl() { return productUrl; }
    public void setProductUrl(String productUrl) { this.productUrl = productUrl; }
    public boolean isClean() { return isClean; }
    public void setClean(boolean clean) { isClean = clean; }
    public int getWearCount() { return wearCount; }
    public void setWearCount(int wearCount) { this.wearCount = wearCount; }
    public LocalDateTime getLastWornAt() { return lastWornAt; }
    public void setLastWornAt(LocalDateTime lastWornAt) { this.lastWornAt = lastWornAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getAiAnalysisJson() { return aiAnalysisJson; }
    public void setAiAnalysisJson(String aiAnalysisJson) { this.aiAnalysisJson = aiAnalysisJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
