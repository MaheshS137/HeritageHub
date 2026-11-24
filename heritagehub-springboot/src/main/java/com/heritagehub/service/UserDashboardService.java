package com.heritagehub.service;

import com.heritagehub.model.UserFavoriteDistrict;
import com.heritagehub.model.UserFavoriteMonument;
import com.heritagehub.model.UserRecentView;
import com.heritagehub.repository.UserFavoriteDistrictRepository;
import com.heritagehub.repository.UserFavoriteMonumentRepository;
import com.heritagehub.repository.UserRecentViewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class UserDashboardService {

    private final UserFavoriteMonumentRepository favMonumentRepo;
    private final UserFavoriteDistrictRepository favDistrictRepo;
    private final UserRecentViewRepository recentViewRepo;

    public UserDashboardService(
            UserFavoriteMonumentRepository favMonumentRepo,
            UserFavoriteDistrictRepository favDistrictRepo,
            UserRecentViewRepository recentViewRepo
    ) {
        this.favMonumentRepo = favMonumentRepo;
        this.favDistrictRepo = favDistrictRepo;
        this.recentViewRepo = recentViewRepo;
    }

    public List<UserFavoriteMonument> getFavoriteMonuments(String accountId) {
        return favMonumentRepo.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<UserFavoriteDistrict> getFavoriteDistricts(String accountId) {
        return favDistrictRepo.findByAccountIdOrderByCreatedAtDesc(accountId);
    }

    public List<UserRecentView> getRecentViews(String accountId) {
        return recentViewRepo.findTop10ByAccountIdOrderByViewedAtDesc(accountId);
    }

    @Transactional
    public void toggleFavoriteMonument(String accountId, String monumentId, String monumentName, String districtId, String districtName, String imageUrl) {
        if (favMonumentRepo.existsByAccountIdAndMonumentId(accountId, monumentId)) {
            favMonumentRepo.deleteByAccountIdAndMonumentId(accountId, monumentId);
        } else {
            UserFavoriteMonument fav = new UserFavoriteMonument();
            fav.setAccountId(accountId);
            fav.setMonumentId(monumentId);
            fav.setMonumentName(monumentName);
            fav.setDistrictId(districtId);
            fav.setDistrictName(districtName);
            fav.setImageUrl(imageUrl == null ? "" : imageUrl);
            favMonumentRepo.save(fav);
        }
    }

    @Transactional
    public void removeFavoriteMonument(String accountId, String monumentId) {
        favMonumentRepo.deleteByAccountIdAndMonumentId(accountId, monumentId);
    }

    @Transactional
    public void toggleFavoriteDistrict(String accountId, String districtId, String districtName, String region, String imageUrl) {
        if (favDistrictRepo.existsByAccountIdAndDistrictId(accountId, districtId)) {
            favDistrictRepo.deleteByAccountIdAndDistrictId(accountId, districtId);
        } else {
            UserFavoriteDistrict fav = new UserFavoriteDistrict();
            fav.setAccountId(accountId);
            fav.setDistrictId(districtId);
            fav.setDistrictName(districtName);
            fav.setRegion(region == null ? "" : region);
            fav.setImageUrl(imageUrl == null ? "" : imageUrl);
            favDistrictRepo.save(fav);
        }
    }

    @Transactional
    public void removeFavoriteDistrict(String accountId, String districtId) {
        favDistrictRepo.deleteByAccountIdAndDistrictId(accountId, districtId);
    }

    @Transactional
    public void recordRecentView(String accountId, String itemType, String itemId, String itemTitle, String districtId, String imageUrl, String routePath) {
        UserRecentView view = recentViewRepo
                .findByAccountIdAndItemTypeAndItemId(accountId, itemType, itemId)
                .orElseGet(UserRecentView::new);
        view.setAccountId(accountId);
        view.setItemType(itemType);
        view.setItemId(itemId);
        view.setItemTitle(itemTitle);
        view.setDistrictId(districtId == null ? "" : districtId);
        view.setImageUrl(imageUrl == null ? "" : imageUrl);
        view.setRoutePath(routePath);
        view.setViewedAt(Instant.now().toString());
        recentViewRepo.save(view);
    }
}
