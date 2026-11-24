package com.heritagehub.controller;

import com.heritagehub.service.CultureService;
import com.heritagehub.service.DistrictService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final DistrictService districtService;
    private final CultureService cultureService;

    public HomeController(DistrictService districtService, CultureService cultureService) {
        this.districtService = districtService;
        this.cultureService = cultureService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("districts", districtService.getAllDistricts());
        model.addAttribute("festivals", cultureService.filter(null, "festivals-celebrations", null));
        model.addAttribute("artsAndCrafts", cultureService.getAllRecords().stream()
                .filter(r -> "traditional-arts".equals(r.getCategorySlug())
                        || "folk-music-dance".equals(r.getCategorySlug())
                        || "handicrafts-textiles".equals(r.getCategorySlug()))
                .toList());
        model.addAttribute("monuments", cultureService.filter(null, "historical-monuments", null));
        return "index";
    }

    @GetMapping("/explore")
    public String explore(Model model) {
        model.addAttribute("districts", districtService.getAllDistricts());
        model.addAttribute("documentedCount", districtService.getAllDistricts().stream().filter(d -> d.isDocumented()).count());
        return "explore";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }
}
