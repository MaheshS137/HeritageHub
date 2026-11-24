package com.heritagehub.config;

import com.heritagehub.model.Account;
import com.heritagehub.model.Role;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.security.CustomUserDetails;
import com.heritagehub.service.AuthService;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;
import java.util.Locale;

@ControllerAdvice
public class GlobalModelAdvice {

    private final AccountRepository accountRepository;

    public GlobalModelAdvice(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @ModelAttribute("currentAccount")
    public Account currentAccount(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails details) {
            return accountRepository.findById(details.getAccountId()).orElse(null);
        }
        return null;
    }

    @ModelAttribute("needsInitialAdmin")
    public boolean needsInitialAdmin() {
        return accountRepository.countByRole(Role.ADMIN) == 0;
    }

    @ModelAttribute("currentLang")
    public String currentLang() {
        Locale loc = LocaleContextHolder.getLocale();
        String code = loc != null ? loc.getLanguage() : "en";
        return ("kn".equals(code) || "hi".equals(code)) ? code : "en";
    }

    @ModelAttribute("dashboardPath")
    public String dashboardPath(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails details) {
            return switch (details.getRole()) {
                case ADMIN -> "/dashboard/admin";
                case JOURNALIST -> "/dashboard/journalist";
                case USER -> "/dashboard/user";
            };
        }
        return "/auth";
    }

    @ModelAttribute("securityQuestions")
    public List<String> securityQuestions() {
        return AuthService.PRESET_SECURITY_QUESTIONS;
    }
}
