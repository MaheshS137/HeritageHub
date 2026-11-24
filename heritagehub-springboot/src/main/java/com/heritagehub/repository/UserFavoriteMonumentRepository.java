package com.heritagehub.repository;

import com.heritagehub.model.UserFavoriteMonument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserFavoriteMonumentRepository extends JpaRepository<UserFavoriteMonument, Long> {
    List<UserFavoriteMonument> findByAccountIdOrderByCreatedAtDesc(String accountId);
    boolean existsByAccountIdAndMonumentId(String accountId, String monumentId);

    @Transactional
    void deleteByAccountIdAndMonumentId(String accountId, String monumentId);
}
