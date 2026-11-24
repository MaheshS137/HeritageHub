package com.heritagehub.controller;

import com.heritagehub.model.Account;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.security.CustomUserDetails;
import com.heritagehub.service.AuthService;
import com.heritagehub.service.UserDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Locale;

@Controller
@RequestMapping("/dashboard/user")
@PreAuthorize("hasRole('USER')")
public class UserDashboardController {

    private final AccountRepository accountRepository;
    private final AuthService authService;
    private final UserDashboardService userDashboardService;
    private final LocaleResolver localeResolver;

    public UserDashboardController(
            AccountRepository accountRepository,
            AuthService authService,
            UserDashboardService userDashboardService,
            LocaleResolver localeResolver
    ) {
        this.accountRepository = accountRepository;
        this.authService = authService;
        this.userDashboardService = userDashboardService;
        this.localeResolver = localeResolver;
    }

    @GetMapping
    public String dashboard(Authentication auth, Model model) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        Account account = accountRepository.findById(details.getAccountId()).orElseThrow();
        model.addAttribute("account", account);
        model.addAttribute("favoriteMonuments", userDashboardService.getFavoriteMonuments(account.getId()));
        model.addAttribute("favoriteDistricts", userDashboardService.getFavoriteDistricts(account.getId()));
        model.addAttribute("recentViews", userDashboardService.getRecentViews(account.getId()));
        return "dashboard-user";
    }

    @PostMapping("/profile")
    public String updateProfile(
            Authentication auth,
            @RequestParam String fullName,
            @RequestParam(required = false) String bioIntro,
            @RequestParam(defaultValue = "en") String preferredLanguage,
            HttpServletRequest request,
            HttpServletResponse response,
            RedirectAttributes ra
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        try {
            Account updated = authService.updateProfile(details.getAccountId(), fullName, bioIntro, preferredLanguage);
            localeResolver.setLocale(request, response, Locale.forLanguageTag(updated.getPreferredLanguage()));
            ra.addFlashAttribute("dashSuccess", "Profile and language preference updated.");
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
        }
        return "redirect:/dashboard/user";
    }

    @PostMapping("/change-password")
    public String changePassword(
            Authentication auth,
            @RequestParam String currentPassword,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword,
            RedirectAttributes ra
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        try {
            authService.changePassword(details.getAccountId(), currentPassword, newPassword, confirmPassword);
            ra.addFlashAttribute("dashSuccess", "Password changed securely. Please sign in again with your new password.");
            return "redirect:/auth";
        } catch (Exception ex) {
            ra.addFlashAttribute("dashError", ex.getMessage());
            return "redirect:/dashboard/user";
        }
    }

    @PostMapping("/favorites/monuments/toggle")
    public String toggleFavoriteMonument(
            Authentication auth,
            @RequestParam String monumentId,
            @RequestParam String monumentName,
            @RequestParam String districtId,
            @RequestParam String districtName,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(defaultValue = "/dashboard/user") String redirectTo
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        userDashboardService.toggleFavoriteMonument(details.getAccountId(), monumentId, monumentName, districtId, districtName, imageUrl);
        return "redirect:" + redirectTo;
    }

    @PostMapping("/favorites/monuments/{monumentId}/remove")
    public String removeFavoriteMonument(Authentication auth, @PathVariable String monumentId) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        userDashboardService.removeFavoriteMonument(details.getAccountId(), monumentId);
        return "redirect:/dashboard/user";
    }

    @PostMapping("/favorites/districts/toggle")
    public String toggleFavoriteDistrict(
            Authentication auth,
            @RequestParam String districtId,
            @RequestParam String districtName,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(defaultValue = "/dashboard/user") String redirectTo
    ) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        userDashboardService.toggleFavoriteDistrict(details.getAccountId(), districtId, districtName, region, imageUrl);
        return "redirect:" + redirectTo;
    }

    @PostMapping("/favorites/districts/{districtId}/remove")
    public String removeFavoriteDistrict(Authentication auth, @PathVariable String districtId) {
        CustomUserDetails details = (CustomUserDetails) auth.getPrincipal();
        userDashboardService.removeFavoriteDistrict(details.getAccountId(), districtId);
        return "redirect:/dashboard/user";
    }
}
