package com.heritagehub.controller;

import com.heritagehub.model.Account;
import com.heritagehub.security.CustomUserDetails;
import com.heritagehub.service.AuthService;
import com.heritagehub.service.PasswordRecoveryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class AuthController {

    private static final String SESSION_RECOVERY_EMAIL = "HH_RECOVERY_EMAIL";
    private static final String SESSION_RECOVERY_ACCOUNT_ID = "HH_RECOVERY_ACCOUNT_ID";

    private final AuthService authService;
    private final PasswordRecoveryService passwordRecoveryService;

    public AuthController(AuthService authService, PasswordRecoveryService passwordRecoveryService) {
        this.authService = authService;
        this.passwordRecoveryService = passwordRecoveryService;
    }

    @GetMapping({"/auth", "/login", "/register"})
    public String authPortal(
            @RequestParam(defaultValue = "USER") String role,
            @RequestParam(defaultValue = "login") String mode,
            Authentication authentication,
            Model model
    ) {
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof CustomUserDetails details) {
            return "redirect:" + switch (details.getRole()) {
                case ADMIN -> "/dashboard/admin";
                case JOURNALIST -> "/dashboard/journalist";
                case USER -> "/dashboard/user";
            };
        }
        model.addAttribute("selectedRole", role.toUpperCase());
        model.addAttribute("authMode", mode);
        return "auth";
    }

    @PostMapping("/register/user")
    public String registerUser(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmPassword,
            @RequestParam String securityQuestion,
            @RequestParam(required = false) String customSecurityQuestion,
            @RequestParam String securityAnswer,
            RedirectAttributes ra
    ) {
        try {
            String effectiveQuestion = "custom".equals(securityQuestion)
                    ? (customSecurityQuestion == null ? "" : customSecurityQuestion)
                    : securityQuestion;
            authService.registerUser(fullName, email, password, confirmPassword, effectiveQuestion, securityAnswer);
            ra.addFlashAttribute("authSuccess", "User account created successfully. Please sign in.");
            return "redirect:/auth?role=USER&mode=login";
        } catch (Exception ex) {
            ra.addFlashAttribute("authError", ex.getMessage());
            return "redirect:/auth?role=USER&mode=register";
        }
    }

    @PostMapping("/register/journalist")
    public String registerJournalist(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmPassword,
            @RequestParam String bioIntro,
            @RequestParam String securityQuestion,
            @RequestParam(required = false) String customSecurityQuestion,
            @RequestParam String securityAnswer,
            RedirectAttributes ra
    ) {
        try {
            String effectiveQuestion = "custom".equals(securityQuestion)
                    ? (customSecurityQuestion == null ? "" : customSecurityQuestion)
                    : securityQuestion;
            authService.registerJournalist(fullName, email, password, confirmPassword, bioIntro, effectiveQuestion, securityAnswer);
            ra.addFlashAttribute("authSuccess", "Journalist account registered. Please sign in to open your studio.");
            return "redirect:/auth?role=JOURNALIST&mode=login";
        } catch (Exception ex) {
            ra.addFlashAttribute("authError", ex.getMessage());
            return "redirect:/auth?role=JOURNALIST&mode=register";
        }
    }

    @PostMapping("/setup-admin")
    public String setupInitialAdmin(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmPassword,
            @RequestParam String securityQuestion,
            @RequestParam(required = false) String customSecurityQuestion,
            @RequestParam String securityAnswer,
            RedirectAttributes ra
    ) {
        try {
            String effectiveQuestion = "custom".equals(securityQuestion)
                    ? (customSecurityQuestion == null ? "" : customSecurityQuestion)
                    : securityQuestion;
            authService.setupInitialAdmin(fullName, email, password, confirmPassword, effectiveQuestion, securityAnswer);
            ra.addFlashAttribute("authSuccess", "Initial administrator provisioned. Sign in with your Admin credentials.");
            return "redirect:/auth?role=ADMIN&mode=login";
        } catch (Exception ex) {
            ra.addFlashAttribute("authError", ex.getMessage());
            return "redirect:/auth?role=ADMIN&mode=login";
        }
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage(
            @RequestParam(defaultValue = "1") int step,
            HttpSession session,
            Model model
    ) {
        String email = (String) session.getAttribute(SESSION_RECOVERY_EMAIL);
        String verifiedAccountId = (String) session.getAttribute(SESSION_RECOVERY_ACCOUNT_ID);
        int activeStep = step;
        if (activeStep == 2 && email == null) activeStep = 1;
        if (activeStep == 3 && verifiedAccountId == null) activeStep = 1;

        if (activeStep == 2 && email != null) {
            Optional<String> qOpt = passwordRecoveryService.lookupSecurityQuestion(email);
            model.addAttribute("securityQuestion", qOpt.orElse("What is the name of the first Karnataka monument or temple you visited?"));
        }
        model.addAttribute("step", activeStep);
        model.addAttribute("recoveryEmail", email);
        return "forgot-password";
    }

    @PostMapping("/forgot-password/question")
    public String lookupQuestion(@RequestParam String email, HttpSession session, RedirectAttributes ra) {
        String clean = AuthService.normalizeEmail(email);
        if (clean.isBlank() || !clean.contains("@")) {
            ra.addFlashAttribute("recoveryError", "Please enter a valid registered email address.");
            return "redirect:/forgot-password?step=1";
        }
        session.setAttribute(SESSION_RECOVERY_EMAIL, clean);
        session.removeAttribute(SESSION_RECOVERY_ACCOUNT_ID);
        return "redirect:/forgot-password?step=2";
    }

    @PostMapping("/forgot-password/verify")
    public String verifySecurityAnswer(@RequestParam String answer, HttpSession session, RedirectAttributes ra) {
        String email = (String) session.getAttribute(SESSION_RECOVERY_EMAIL);
        if (email == null) {
            return "redirect:/forgot-password?step=1";
        }
        try {
            Account account = passwordRecoveryService.verifySecurityAnswer(email, answer);
            session.setAttribute(SESSION_RECOVERY_ACCOUNT_ID, account.getId());
            return "redirect:/forgot-password?step=3";
        } catch (Exception ex) {
            ra.addFlashAttribute("recoveryError", ex.getMessage());
            return "redirect:/forgot-password?step=2";
        }
    }

    @PostMapping("/forgot-password/reset")
    public String resetPassword(
            @RequestParam String newPassword,
            @RequestParam String confirmPassword,
            HttpSession session,
            RedirectAttributes ra
    ) {
        String accountId = (String) session.getAttribute(SESSION_RECOVERY_ACCOUNT_ID);
        if (accountId == null) {
            ra.addFlashAttribute("recoveryError", "Verification expired. Please start recovery again.");
            return "redirect:/forgot-password?step=1";
        }
        try {
            passwordRecoveryService.resetPassword(accountId, newPassword, confirmPassword);
            session.removeAttribute(SESSION_RECOVERY_EMAIL);
            session.removeAttribute(SESSION_RECOVERY_ACCOUNT_ID);
            ra.addFlashAttribute("authSuccess", "Password updated securely. All prior sessions were signed out.");
            return "redirect:/auth?mode=login";
        } catch (Exception ex) {
            ra.addFlashAttribute("recoveryError", ex.getMessage());
            return "redirect:/forgot-password?step=3";
        }
    }
}
