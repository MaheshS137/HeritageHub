package com.heritagehub.repository;

import com.heritagehub.model.UserRecentView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRecentViewRepository extends JpaRepository<UserRecentView, Long> {
    List<UserRecentView> findTop10ByAccountIdOrderByViewedAtDesc(String accountId);
    Optional<UserRecentView> findByAccountIdAndItemTypeAndItemId(String accountId, String itemType, String itemId);
}
