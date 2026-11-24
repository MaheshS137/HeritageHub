package com.heritagehub.repository;

import com.heritagehub.model.UserFavoriteDistrict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserFavoriteDistrictRepository extends JpaRepository<UserFavoriteDistrict, Long> {
    List<UserFavoriteDistrict> findByAccountIdOrderByCreatedAtDesc(String accountId);
    boolean existsByAccountIdAndDistrictId(String accountId, String districtId);

    @Transactional
    void deleteByAccountIdAndDistrictId(String accountId, String districtId);
}
