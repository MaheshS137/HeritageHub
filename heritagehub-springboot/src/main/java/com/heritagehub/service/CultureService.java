package com.heritagehub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.heritagehub.model.CulturalRecord;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class CultureService {

    private static final List<String> DATA_FILES = List.of(
            "data/festivals.json",
            "data/arts.json",
            "data/heritage-sites.json",
            "data/cuisine.json"
    );

    private final JsonDataService jsonDataService;
    private List<CulturalRecord> records = Collections.emptyList();

    public CultureService(JsonDataService jsonDataService) {
        this.jsonDataService = jsonDataService;
    }

    @PostConstruct
    public void loadCulturalRecords() {
        List<CulturalRecord> aggregated = new ArrayList<>();
        for (String path : DATA_FILES) {
            aggregated.addAll(jsonDataService.readList(path, new TypeReference<>() {}));
        }
        this.records = Collections.unmodifiableList(aggregated);
    }

    public List<CulturalRecord> getAllRecords() {
        return records;
    }

    public Optional<CulturalRecord> findByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            return Optional.empty();
        }
        String key = idOrSlug.trim().toLowerCase(Locale.ROOT);
        return records.stream()
                .filter(r -> (r.getId() != null && r.getId().equalsIgnoreCase(key))
                        || (r.getSlug() != null && r.getSlug().equalsIgnoreCase(key)))
                .findFirst();
    }

    public List<CulturalRecord> filter(String districtId, String category, String query) {
        String dFilter = districtId != null ? districtId.trim().toLowerCase(Locale.ROOT) : "";
        String cFilter = category != null ? category.trim().toLowerCase(Locale.ROOT) : "";
        String qFilter = query != null ? query.trim().toLowerCase(Locale.ROOT) : "";

        return records.stream()
                .filter(r -> dFilter.isEmpty() || "all".equals(dFilter)
                        || (r.getDistrictId() != null && r.getDistrictId().equalsIgnoreCase(dFilter))
                        || (r.getDistrictName() != null && r.getDistrictName().equalsIgnoreCase(dFilter)))
                .filter(r -> cFilter.isEmpty() || "all".equals(cFilter)
                        || (r.getCategorySlug() != null && r.getCategorySlug().equalsIgnoreCase(cFilter))
                        || (r.getCategory() != null && r.getCategory().equalsIgnoreCase(cFilter)))
                .filter(r -> qFilter.isEmpty() || matchesQuery(r, qFilter))
                .toList();
    }

    private boolean matchesQuery(CulturalRecord record, String q) {
        return contains(record.getTitle(), q)
                || contains(record.getDistrictName(), q)
                || contains(record.getCategory(), q)
                || contains(record.getDescription(), q)
                || contains(record.getSourceOrganization(), q);
    }

    private boolean contains(String field, String q) {
        return field != null && field.toLowerCase(Locale.ROOT).contains(q);
    }
}
