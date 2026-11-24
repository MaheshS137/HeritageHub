package com.heritagehub.service;

import com.heritagehub.model.District;
import com.heritagehub.model.Monument;
import com.heritagehub.repository.MonumentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MonumentService {

    private final MonumentRepository monumentRepository;
    private final DistrictService districtService;

    public MonumentService(MonumentRepository monumentRepository, DistrictService districtService) {
        this.monumentRepository = monumentRepository;
        this.districtService = districtService;
    }

    @PostConstruct
    public void seedMonumentsIfEmpty() {
        if (monumentRepository.count() > 0) return;
        for (District d : districtService.getAllDistricts()) {
            Monument m = new Monument();
            m.setId(d.getId());
            m.setDistrictId(d.getId());
            m.setDistrictName(d.getName());
            m.setName(d.getMonumentName());
            m.setLocation(d.getMonumentLocation() != null ? d.getMonumentLocation() : d.getName());
            m.setEraOrDynasty(d.getMonumentAttribution() != null ? d.getMonumentAttribution() : "");
            m.setDescription(d.getMonumentDescription() != null ? d.getMonumentDescription() : d.getDescription());
            m.setCulturalSignificance(d.getCulturalSignificance() != null ? d.getCulturalSignificance() : "");
            m.setImageUrl(d.getMonumentImageKey() != null ? d.getMonumentImageKey() : "");
            m.setFlagship(true);
            m.setCreatedAt(Instant.now().toString());
            monumentRepository.save(m);
        }
    }

    public List<Monument> getAllMonuments() {
        return monumentRepository.findAllByOrderByDistrictNameAscNameAsc();
    }

    public List<Monument> getMonumentsByDistrict(String districtId) {
        return monumentRepository.findByDistrictIdIgnoreCaseOrderByNameAsc(districtId);
    }

    @Transactional
    public Monument saveMonument(String id, String districtId, String name, String location, String eraOrDynasty, String description, String culturalSignificance, String imageUrl) {
        District d = districtService.findById(districtId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid district."));
        if (name == null || name.trim().length() < 3) {
            throw new IllegalArgumentException("Monument name is required.");
        }

        Monument m = (id != null && !id.isBlank())
                ? monumentRepository.findById(id).orElse(new Monument())
                : new Monument();
        if (m.getId() == null) {
            m.setId("mon-" + UUID.randomUUID().toString().substring(0, 8));
        }
        m.setDistrictId(d.getId());
        m.setDistrictName(d.getName());
        m.setName(name.trim());
        m.setLocation(location == null ? "" : location.trim());
        m.setEraOrDynasty(eraOrDynasty == null ? "" : eraOrDynasty.trim());
        m.setDescription(description == null ? "" : description.trim());
        m.setCulturalSignificance(culturalSignificance == null ? "" : culturalSignificance.trim());
        if (imageUrl != null && !imageUrl.isBlank()) {
            m.setImageUrl(imageUrl.trim());
        }
        return monumentRepository.save(m);
    }

    @Transactional
    public void deleteMonument(String id) {
        monumentRepository.deleteById(id);
    }
}
