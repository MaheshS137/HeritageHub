package com.heritagehub.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_recent_views", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"account_id", "item_type", "item_id"})
})
public class UserRecentView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "item_type", nullable = false)
    private String itemType;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "item_title", nullable = false)
    private String itemTitle;

    @Column(name = "district_id", nullable = false)
    private String districtId = "";

    @Column(name = "image_url", nullable = false)
    private String imageUrl = "";

    @Column(name = "route_path", nullable = false)
    private String routePath;

    @Column(name = "viewed_at", nullable = false)
    private String viewedAt = Instant.now().toString();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getRoutePath() { return routePath; }
    public void setRoutePath(String routePath) { this.routePath = routePath; }

    public String getViewedAt() { return viewedAt; }
    public void setViewedAt(String viewedAt) { this.viewedAt = viewedAt; }
}
