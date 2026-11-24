package com.heritagehub.repository;

import com.heritagehub.model.Monument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonumentRepository extends JpaRepository<Monument, String> {
    List<Monument> findByDistrictIdIgnoreCaseOrderByNameAsc(String districtId);
    List<Monument> findAllByOrderByDistrictNameAscNameAsc();
}
