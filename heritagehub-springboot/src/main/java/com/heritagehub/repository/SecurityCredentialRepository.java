package com.heritagehub.repository;

import com.heritagehub.model.SecurityCredential;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecurityCredentialRepository extends JpaRepository<SecurityCredential, String> {
}
