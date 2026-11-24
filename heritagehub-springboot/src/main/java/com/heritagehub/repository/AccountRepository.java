package com.heritagehub.repository;

import com.heritagehub.model.Account;
import com.heritagehub.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
    List<Account> findAllByOrderByCreatedAtDesc();
}
