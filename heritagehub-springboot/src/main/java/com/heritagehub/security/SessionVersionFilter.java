package com.heritagehub.security;

import com.heritagehub.model.Account;
import com.heritagehub.repository.AccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class SessionVersionFilter extends OncePerRequestFilter {

    private final AccountRepository accountRepository;

    public SessionVersionFilter(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails details) {
            Optional<Account> latestOpt = accountRepository.findById(details.getAccountId());
            if (latestOpt.isEmpty()
                    || !latestOpt.get().isActive()
                    || latestOpt.get().getSessionVersion() != details.getSessionVersion()) {
                SecurityContextHolder.clearContext();
                if (request.getSession(false) != null) {
                    request.getSession(false).invalidate();
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
