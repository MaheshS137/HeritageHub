package com.heritagehub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.heritagehub.model.District;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DistrictService {

    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("bangalore", "bengaluru-urban"),
            Map.entry("bangalore urban", "bengaluru-urban"),
            Map.entry("bangalore rural", "bengaluru-rural"),
            Map.entry("belgaum", "belagavi"),
            Map.entry("bellary", "ballari"),
            Map.entry("bijapur", "vijayapura"),
            Map.entry("chikmagalur", "chikkamagaluru"),
            Map.entry("gulbarga", "kalaburagi"),
            Map.entry("mysore", "mysuru"),
            Map.entry("shimoga", "shivamogga"),
            Map.entry("tumkur", "tumakuru"),
            Map.entry("coorg", "kodagu"),
            Map.entry("hampi", "vijayanagara")
    );

    private final JsonDataService jsonDataService;
    private List<District> districts = Collections.emptyList();
    private final Map<String, District> districtById = new ConcurrentHashMap<>();

    public DistrictService(JsonDataService jsonDataService) {
        this.jsonDataService = jsonDataService;
    }

    @PostConstruct
    public void loadDistricts() {
        List<District> loaded = jsonDataService.readList(
                "data/districts.json",
                new TypeReference<>() {}
        );
        this.districts = Collections.unmodifiableList(loaded);
        districtById.clear();
        for (District district : loaded) {
            if (district.getId() != null && !district.getId().isBlank()) {
                districtById.put(district.getId().toLowerCase(Locale.ROOT), district);
            }
        }
    }

    public List<District> getAllDistricts() {
        return districts;
    }

    public Optional<District> findById(String rawId) {
        if (rawId == null || rawId.isBlank()) {
            return Optional.empty();
        }
        String normalized = normalizeKey(rawId);
        District direct = districtById.get(normalized);
        if (direct != null) {
            return Optional.of(direct);
        }
        return districts.stream()
                .filter(d -> d.getName() != null && normalizeKey(d.getName()).equals(normalized))
                .findFirst();
    }

    public List<District> findRelatedDistricts(District current, int limit) {
        if (current == null) {
            return Collections.emptyList();
        }
        return districts.stream()
                .filter(d -> !d.getId().equalsIgnoreCase(current.getId()))
                .filter(d -> current.getRegion().equalsIgnoreCase(d.getRegion()) || d.isDocumented())
                .limit(limit)
                .toList();
    }

    public String getKarnatakaGeoJson() {
        return jsonDataService.readRawText("data/karnataka-districts.geojson");
    }

    private String normalizeKey(String value) {
        String lower = value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
        if (ALIASES.containsKey(lower)) {
            return ALIASES.get(lower);
        }
        return lower.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
