package com.heritagehub.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_favorite_monuments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "monument_id"})
})
public class UserFavoriteMonument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "monument_id", nullable = false)
    private String monumentId;

    @Column(name = "monument_name", nullable = false)
    private String monumentName;

    @Column(name = "district_id", nullable = false)
    private String districtId;

    @Column(name = "district_name", nullable = false)
    private String districtName;

    @Column(name = "image_url", nullable = false)
    private String imageUrl = "";

    @Column(name = "created_at", nullable = false)
    private String createdAt = Instant.now().toString();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getMonumentId() { return monumentId; }
    public void setMonumentId(String monumentId) { this.monumentId = monumentId; }

    public String getMonumentName() { return monumentName; }
    public void setMonumentName(String monumentName) { this.monumentName = monumentName; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getDistrictName() { return districtName; }
    public void setDistrictName(String districtName) { this.districtName = districtName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
