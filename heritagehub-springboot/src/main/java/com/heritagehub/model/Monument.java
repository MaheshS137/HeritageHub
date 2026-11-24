package com.heritagehub.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "monuments")
public class Monument {

    @Id
    private String id;

    @Column(name = "district_id", nullable = false)
    private String districtId;

    @Column(name = "district_name", nullable = false)
    private String districtName;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location = "";

    @Column(name = "era_or_dynasty", nullable = false)
    private String eraOrDynasty = "";

    @Column(nullable = false, length = 3000)
    private String description = "";

    @Column(name = "cultural_significance", nullable = false, length = 3000)
    private String culturalSignificance = "";

    @Column(name = "image_url", nullable = false)
    private String imageUrl = "";

    @Column(name = "is_flagship", nullable = false)
    private boolean flagship = false;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    public Monument() {
        this.createdAt = Instant.now().toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEraOrDynasty() { return eraOrDynasty; }
    public void setEraOrDynasty(String eraOrDynasty) { this.eraOrDynasty = eraOrDynasty; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCulturalSignificance() { return culturalSignificance; }
    public void setCulturalSignificance(String culturalSignificance) { this.culturalSignificance = culturalSignificance; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isFlagship() { return flagship; }
    public void setFlagship(boolean flagship) { this.flagship = flagship; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
