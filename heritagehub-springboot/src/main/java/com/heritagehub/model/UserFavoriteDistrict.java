package com.heritagehub.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_favorite_districts", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "district_id"})
})
public class UserFavoriteDistrict {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "district_id", nullable = false)
    private String districtId;

    @Column(name = "district_name", nullable = false)
    private String districtName;

    @Column(nullable = false)
    private String region = "";

    @Column(name = "image_url", nullable = false)
    private String imageUrl = "";

    @Column(name = "created_at", nullable = false)
    private String createdAt = Instant.now().toString();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
