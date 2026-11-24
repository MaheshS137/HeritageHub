package com.heritagehub.controller;

import com.heritagehub.model.Account;
import com.heritagehub.model.ArticleStatus;
import com.heritagehub.model.Role;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.repository.ArticleRepository;
import com.heritagehub.repository.MonumentRepository;
import com.heritagehub.security.CustomUserDetails;
import com.heritagehub.service.ArticleService;
import com.heritagehub.service.AuthService;
import com.heritagehub.service.DistrictService;
import com.heritagehub.service.MonumentService;
import com.heritagehub.service.UploadService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/dashboard/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AccountRepository accountRepository;
    private final ArticleRepository articleRepository;
    private final MonumentRepository monumentRepository;
    private final AuthService authService;
    private final ArticleService articleService;
    private final MonumentService monumentService;
    private final DistrictService districtService;
    private final UploadService uploadService;

    public AdminController(
            AccountRepository accountRepository,
            ArticleRepository articleRepository,
            MonumentRepository monumentRepository,
            AuthService authService,
            ArticleService articleService,
            MonumentService monumentService,
            DistrictService districtService,
            UploadService uploadService
    ) {
        this.accountRepository = accountRepository;
        this.articleRepository = articleRepository;
        this.monumentRepository = monumentRepository;
        this.authService = authService;
        this.articleService = articleService;
        this.monumentService = monumentService;
        this.districtService = districtService;
        this.uploadService = uploadService;
    }

    @GetMapping
    public String dashboard(@RequestParam(required = false) String q, Model model) {
        var allAccounts = accountRepository.findAllByOrderByCreatedAtDesc();
        if (q != null && !q.isBlank()) {
            String lower = q.trim().toLowerCase();
            allAccounts = allAccounts.stream()
                    .filter(a -> a.getFullName().toLowerCase().contains(lower)
                            || a.getEmail().toLowerCase().contains(lower))
                    .toList();
        }
        model.addAttribute("searchQuery", q == null ? "" : q);
        model.addAttribute("totalUsers", accountRepository.countByRole(Role.USER));
        model.addAttribute("totalJournalists", accountRepository.countByRole(Role.JOURNALIST));
        model.addAttribute("totalDistricts", districtService.getAllDistricts().size());
        model.addAttribute("totalMonuments", monumentRepository.count());
        model.addAttribute("pendingArticlesCount", articleRepository.countByStatus(ArticleStatus.PENDING_REVIEW));
        model.addAttribute("publishedArticlesCount", articleRepository.countByStatus(ArticleStatus.PUBLISHED));

        model.addAttribute("accounts", allAccounts);
        model.addAttribute("articles", articleService.getAllArticlesForAdmin());
        model.addAttribute("monuments", monumentService.getAllMonuments());
        model.addAttribute("districts", districtService.getAllDistricts());
        return "dashboard-admin";
    }

    @PostMapping("/users/{id}/status")
    public String toggleUserStatus(
            Authentication auth,
            @PathVariable String id,
            @RequestParam boolean active,
            RedirectAttributes ra
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        try {
            authService.toggleUserStatus(details.getAccountId(), id, active);
            ra.addFlashAttribute("dashSuccess", active ? "Account activated." : "Account deactivated.");
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
        }
        return "redirect:/dashboard/admin";
    }

    @PostMapping("/admins")
    public String createAdmin(
            Authentication auth,
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmPassword,
            @RequestParam String securityQuestion,
            @RequestParam String securityAnswer,
            RedirectAttributes ra
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        Account actor = accountRepository.findById(details.getAccountId()).orElseThrow();
        try {
            authService.createSubsequentAdmin(actor, fullName, email, password, confirmPassword, securityQuestion, securityAnswer);
            ra.addFlashAttribute("dashSuccess", "New administrator account provisioned.");
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
        }
        return "redirect:/dashboard/admin";
    }

    @PostMapping("/articles/{id}/review")
    public String reviewArticle(
            Authentication auth,
            @PathVariable String id,
            @RequestParam ArticleStatus status,
            @RequestParam(required = false) String feedback,
            RedirectAttributes ra
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        Account admin = accountRepository.findById(details.getAccountId()).orElseThrow();
        try {
            articleService.reviewArticle(admin, id, status, feedback);
            ra.addFlashAttribute("dashSuccess", "Article status updated to " + status.name() + ".");
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
        }
        return "redirect:/dashboard/admin";
    }

    @PostMapping("/monuments")
    public String saveMonument(
            @RequestParam(required = false) String id,
            @RequestParam String districtId,
            @RequestParam String name,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String eraOrDynasty,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String culturalSignificance,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(required = false) MultipartFile photo,
            RedirectAttributes ra
    ) {
        try {
            String effectiveImage = imageUrl == null ? "" : imageUrl;
            if (photo != null && !photo.isEmpty()) {
                effectiveImage = uploadService.storeImage(photo);
            }
            monumentService.saveMonument(id, districtId, name, location, eraOrDynasty, description, culturalSignificance, effectiveImage);
            ra.addFlashAttribute("dashSuccess", "Monument saved to archive.");
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
        }
        return "redirect:/dashboard/admin";
    }

    @PostMapping("/monuments/{id}/delete")
    public String deleteMonument(@PathVariable String id, RedirectAttributes ra) {
        monumentService.deleteMonument(id);
        ra.addFlashAttribute("dashSuccess", "Monument deleted.");
        return "redirect:/dashboard/admin";
    }
}
