package com.heritagehub.controller;

import com.heritagehub.model.Article;
import com.heritagehub.model.ArticleStatus;
import com.heritagehub.model.CulturalRecord;
import com.heritagehub.repository.ArticleRepository;
import com.heritagehub.service.ArticleService;
import com.heritagehub.service.CultureService;
import com.heritagehub.service.DistrictService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Controller
public class CultureController {

    private static final List<Map<String, String>> CATEGORIES = List.of(
            Map.of("slug", "festivals-celebrations", "title", "Festivals and Celebrations"),
            Map.of("slug", "traditional-arts", "title", "Traditional Arts"),
            Map.of("slug", "folk-music-dance", "title", "Folk Music and Dance"),
            Map.of("slug", "historical-monuments", "title", "Historical Monuments"),
            Map.of("slug", "food-cuisine", "title", "Food and Cuisine"),
            Map.of("slug", "handicrafts-textiles", "title", "Handicrafts and Textiles"),
            Map.of("slug", "customs-traditions", "title", "Customs and Traditions")
    );

    private final CultureService cultureService;
    private final DistrictService districtService;
    private final ArticleService articleService;
    private final ArticleRepository articleRepository;

    public CultureController(
            CultureService cultureService,
            DistrictService districtService,
            ArticleService articleService,
            ArticleRepository articleRepository
    ) {
        this.cultureService = cultureService;
        this.districtService = districtService;
        this.articleService = articleService;
        this.articleRepository = articleRepository;
    }

    @GetMapping("/culture")
    public String culturePage(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            Model model
    ) {
        List<CulturalRecord> filtered = cultureService.filter(district, category, q);
        List<Article> publishedArticles = articleService.getPublishedArticles();
        model.addAttribute("categories", CATEGORIES);
        model.addAttribute("districts", districtService.getAllDistricts());
        model.addAttribute("records", filtered);
        model.addAttribute("publishedArticles", publishedArticles);
        model.addAttribute("selectedDistrict", district != null ? district : "all");
        model.addAttribute("selectedCategory", category != null ? category : "all");
        model.addAttribute("searchQuery", q != null ? q : "");
        return "culture";
    }

    @GetMapping("/article/{slug}")
    public String articleDetail(@PathVariable String slug, Model model) {
        Article article = articleRepository.findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Published article not found"));
        model.addAttribute("article", article);
        return "article";
    }

    @GetMapping("/api/culture")
    @ResponseBody
    public List<CulturalRecord> apiCulture(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q
    ) {
        return cultureService.filter(district, category, q);
    }

    @GetMapping("/api/culture/{id}")
    @ResponseBody
    public ResponseEntity<?> apiCultureById(@PathVariable String id) {
        return cultureService.findByIdOrSlug(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Cultural record not found", "id", id)));
    }
}
