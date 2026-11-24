package com.heritagehub.controller;

import com.heritagehub.model.Account;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.security.CustomUserDetails;
import com.heritagehub.service.ArticleService;
import com.heritagehub.service.DistrictService;
import com.heritagehub.service.UploadService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/dashboard/journalist")
@PreAuthorize("hasRole('JOURNALIST')")
public class JournalistController {

    private final AccountRepository accountRepository;
    private final ArticleService articleService;
    private final DistrictService districtService;
    private final UploadService uploadService;

    public JournalistController(
            AccountRepository accountRepository,
            ArticleService articleService,
            DistrictService districtService,
            UploadService uploadService
    ) {
        this.accountRepository = accountRepository;
        this.articleService = articleService;
        this.districtService = districtService;
        this.uploadService = uploadService;
    }

    @GetMapping
    public String dashboard(Authentication auth, @RequestParam(required = false) String editId, Model model) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        Account journalist = accountRepository.findById(details.getAccountId()).orElseThrow();
        var articles = articleService.getJournalistArticles(journalist.getId());

        model.addAttribute("journalist", journalist);
        model.addAttribute("articles", articles);
        model.addAttribute("districts", districtService.getAllDistricts());
        if (editId != null && !editId.isBlank()) {
            articles.stream()
                    .filter(a -> a.getId().equals(editId))
                    .findFirst()
                    .ifPresent(a -> model.addAttribute("editingArticle", a));
        }
        return "dashboard-journalist";
    }

    @PostMapping("/articles")
    public String saveOrSubmitArticle(
            Authentication auth,
            @RequestParam(required = false) String articleId,
            @RequestParam String title,
            @RequestParam String shortDescription,
            @RequestParam String content,
            @RequestParam String districtId,
            @RequestParam String categorySlug,
            @RequestParam(required = false) String existingCoverUrl,
            @RequestParam(required = false) MultipartFile coverPhoto,
            @RequestParam(defaultValue = "draft") String action,
            RedirectAttributes ra
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        Account journalist = accountRepository.findById(details.getAccountId()).orElseThrow();
        try {
            String coverUrl = existingCoverUrl == null ? "" : existingCoverUrl;
            if (coverPhoto != null && !coverPhoto.isEmpty()) {
                coverUrl = uploadService.storeImage(coverPhoto);
            }
            boolean submit = "submit".equalsIgnoreCase(action);
            articleService.saveJournalistArticle(
                    journalist, articleId, title, shortDescription, content, districtId, categorySlug, coverUrl, submit
            );
            ra.addFlashAttribute("dashSuccess",
                    submit ? "Article submitted for administrator review." : "Article saved as draft.");
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
        }
        return "redirect:/dashboard/journalist";
    }
}
