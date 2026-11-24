package com.heritagehub.service;

import com.heritagehub.model.Account;
import com.heritagehub.model.SecurityCredential;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.repository.SecurityCredentialRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
public class PasswordRecoveryService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private final AccountRepository accountRepository;
    private final SecurityCredentialRepository securityCredentialRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordRecoveryService(
            AccountRepository accountRepository,
            SecurityCredentialRepository securityCredentialRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.accountRepository = accountRepository;
        this.securityCredentialRepository = securityCredentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<String> lookupSecurityQuestion(String email) {
        String normalized = AuthService.normalizeEmail(email);
        Optional<Account> accountOpt = accountRepository.findByEmailIgnoreCase(normalized);
        if (accountOpt.isEmpty() || !accountOpt.get().isActive()) {
            return Optional.empty();
        }
        return securityCredentialRepository.findById(accountOpt.get().getId())
                .map(SecurityCredential::getQuestion);
    }

    @Transactional
    public Account verifySecurityAnswer(String email, String rawAnswer) {
        String normalizedEmail = AuthService.normalizeEmail(email);
        String normalizedAnswer = AuthService.normalizeSecurityAnswer(rawAnswer);

        Account account = accountRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Security answer did not match our records."));
        if (!account.isActive()) {
            throw new IllegalArgumentException("This account is currently deactivated.");
        }

        SecurityCredential cred = securityCredentialRepository.findById(account.getId())
                .orElseThrow(() -> new IllegalArgumentException("Security question recovery is not configured for this account."));

        if (cred.getLockedUntil() != null) {
            Instant lockExpiry = Instant.parse(cred.getLockedUntil());
            if (lockExpiry.isAfter(Instant.now())) {
                throw new IllegalArgumentException("Too many incorrect attempts. Recovery is locked for 15 minutes.");
            }
        }

        if (!passwordEncoder.matches(normalizedAnswer, cred.getAnswerHash())) {
            int nextAttempts = cred.getFailedAttempts() + 1;
            cred.setFailedAttempts(nextAttempts);
            if (nextAttempts >= MAX_ATTEMPTS) {
                cred.setLockedUntil(Instant.now().plus(LOCK_MINUTES, ChronoUnit.MINUTES).toString());
            }
            securityCredentialRepository.save(cred);
            throw new IllegalArgumentException("Security answer is incorrect.");
        }

        cred.setFailedAttempts(0);
        cred.setLockedUntil(null);
        securityCredentialRepository.save(cred);
        return account;
    }

    @Transactional
    public void resetPassword(String accountId, String newPassword, String confirmPassword) {
        if (newPassword == null || !newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }
        AuthService.validatePasswordStrength(newPassword);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setSessionVersion(account.getSessionVersion() + 1);
        account.setUpdatedAt(Instant.now().toString());
        accountRepository.save(account);
    }
}
