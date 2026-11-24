package com.heritagehub.controller;

import com.heritagehub.model.District;
import com.heritagehub.model.Role;
import com.heritagehub.security.CustomUserDetails;
import com.heritagehub.service.ArticleService;
import com.heritagehub.service.CultureService;
import com.heritagehub.service.DistrictService;
import com.heritagehub.service.MonumentService;
import com.heritagehub.service.UserDashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Controller
public class DistrictController {

    private final DistrictService districtService;
    private final CultureService cultureService;
    private final MonumentService monumentService;
    private final ArticleService articleService;
    private final UserDashboardService userDashboardService;

    public DistrictController(
            DistrictService districtService,
            CultureService cultureService,
            MonumentService monumentService,
            ArticleService articleService,
            UserDashboardService userDashboardService
    ) {
        this.districtService = districtService;
        this.cultureService = cultureService;
        this.monumentService = monumentService;
        this.articleService = articleService;
        this.userDashboardService = userDashboardService;
    }

    @GetMapping("/district/{id}")
    public String districtDetail(@PathVariable String id, Authentication authentication, Model model) {
        District district = districtService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "District not found: " + id));
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails details
                && details.getRole() == Role.USER) {
            userDashboardService.recordRecentView(
                    details.getAccountId(),
                    "district",
                    district.getId(),
                    district.getName() + " — " + district.getMonumentName(),
                    district.getId(),
                    district.getMonumentImageKey(),
                    "/district/" + district.getId()
            );
        }
        model.addAttribute("district", district);
        model.addAttribute("districtRecords", cultureService.filter(district.getId(), null, null));
        model.addAttribute("relatedDistricts", districtService.findRelatedDistricts(district, 4));
        model.addAttribute("extraMonuments", monumentService.getMonumentsByDistrict(district.getId()));
        model.addAttribute("districtArticles", articleService.getPublishedArticlesByDistrict(district.getId()));
        return "district";
    }

    @GetMapping("/api/districts")
    @ResponseBody
    public List<District> apiDistricts() {
        return districtService.getAllDistricts();
    }

    @GetMapping("/api/districts/{id}")
    @ResponseBody
    public ResponseEntity<?> apiDistrictById(@PathVariable String id) {
        return districtService.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "District not found", "districtId", id)));
    }

    @GetMapping(value = "/data/karnataka-districts.geojson", produces = "application/geo+json")
    @ResponseBody
    public ResponseEntity<String> serveGeoJson() {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(districtService.getKarnatakaGeoJson());
    }

    @GetMapping(value = "/data/districts.json", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public List<District> serveDistrictsJson() {
        return districtService.getAllDistricts();
    }
}
