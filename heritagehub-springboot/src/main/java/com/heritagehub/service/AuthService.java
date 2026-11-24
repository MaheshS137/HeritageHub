package com.heritagehub.service;

import com.heritagehub.model.Account;
import com.heritagehub.model.Role;
import com.heritagehub.model.SecurityCredential;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.repository.SecurityCredentialRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AuthService {

    public static final List<String> PRESET_SECURITY_QUESTIONS = List.of(
            "What is the name of the first Karnataka monument or temple you visited?",
            "What is the name of your childhood school?",
            "In which city or town was your mother born?",
            "What was the name of your favorite childhood teacher?",
            "What is your favorite traditional Karnataka dish?"
    );

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final AccountRepository accountRepository;
    private final SecurityCredentialRepository securityCredentialRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AccountRepository accountRepository,
            SecurityCredentialRepository securityCredentialRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.accountRepository = accountRepository;
        this.securityCredentialRepository = securityCredentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeSecurityAnswer(String answer) {
        return answer == null ? "" : answer.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    public static void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        if (!password.matches(".*[A-Za-z].*") || !password.matches(".*\\d.*")) {
            throw new IllegalArgumentException("Password must contain at least one letter and one number.");
        }
    }

    public boolean needsInitialAdmin() {
        return accountRepository.countByRole(Role.ADMIN) == 0;
    }

    @Transactional
    public Account registerUser(String fullName, String email, String password, String confirmPassword, String securityQuestion, String securityAnswer) {
        return createAccount(Role.USER, fullName, email, password, confirmPassword, "", securityQuestion, securityAnswer);
    }

    @Transactional
    public Account registerJournalist(String fullName, String email, String password, String confirmPassword, String bioIntro, String securityQuestion, String securityAnswer) {
        if (bioIntro == null || bioIntro.trim().length() < 15) {
            throw new IllegalArgumentException("Journalists must provide a short professional introduction (at least 15 characters).");
        }
        return createAccount(Role.JOURNALIST, fullName, email, password, confirmPassword, bioIntro.trim(), securityQuestion, securityAnswer);
    }

    @Transactional
    public Account setupInitialAdmin(String fullName, String email, String password, String confirmPassword, String securityQuestion, String securityAnswer) {
        if (!needsInitialAdmin()) {
            throw new AccessDeniedException("Initial administrator setup is locked because an administrator already exists.");
        }
        return createAccount(Role.ADMIN, fullName, email, password, confirmPassword, "Founding HeritageHub Administrator", securityQuestion, securityAnswer);
    }

    @Transactional
    public Account createSubsequentAdmin(Account actor, String fullName, String email, String password, String confirmPassword, String securityQuestion, String securityAnswer) {
        if (actor == null || actor.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only an authenticated administrator can create another administrator account.");
        }
        return createAccount(Role.ADMIN, fullName, email, password, confirmPassword, "HeritageHub Platform Administrator", securityQuestion, securityAnswer);
    }

    private Account createAccount(
            Role enforcedRole,
            String fullName,
            String rawEmail,
            String password,
            String confirmPassword,
            String bioIntro,
            String securityQuestion,
            String rawSecurityAnswer
    ) {
        String cleanName = fullName == null ? "" : fullName.trim();
        String email = normalizeEmail(rawEmail);
        String question = securityQuestion == null ? "" : securityQuestion.trim();
        String normalizedAnswer = normalizeSecurityAnswer(rawSecurityAnswer);

        if (cleanName.length() < 2) {
            throw new IllegalArgumentException("Full name must be at least 2 characters.");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }
        if (password == null || !password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }
        validatePasswordStrength(password);

        if (question.length() < 5) {
            throw new IllegalArgumentException("Please select or enter a security question.");
        }
        if (normalizedAnswer.length() < 2) {
            throw new IllegalArgumentException("Please provide a security answer.");
        }
        if (accountRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        String now = Instant.now().toString();
        Account account = new Account();
        account.setId(UUID.randomUUID().toString());
        account.setFullName(cleanName);
        account.setEmail(email);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.setRole(enforcedRole);
        account.setBioIntro(bioIntro == null ? "" : bioIntro);
        account.setPreferredLanguage("en");
        account.setActive(true);
        account.setSessionVersion(1);
        account.setCreatedAt(now);
        account.setUpdatedAt(now);
        accountRepository.save(account);

        SecurityCredential cred = new SecurityCredential();
        cred.setAccountId(account.getId());
        cred.setQuestion(question);
        cred.setAnswerHash(passwordEncoder.encode(normalizedAnswer));
        cred.setFailedAttempts(0);
        cred.setLockedUntil(null);
        securityCredentialRepository.save(cred);

        return account;
    }

    @Transactional
    public Account updateProfile(String accountId, String fullName, String bioIntro, String preferredLanguage) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        String cleanName = fullName == null ? "" : fullName.trim();
        if (cleanName.length() < 2) {
            throw new IllegalArgumentException("Full name must be at least 2 characters.");
        }
        account.setFullName(cleanName);
        account.setBioIntro(bioIntro == null ? "" : bioIntro.trim());
        if ("kn".equals(preferredLanguage) || "hi".equals(preferredLanguage) || "en".equals(preferredLanguage)) {
            account.setPreferredLanguage(preferredLanguage);
        }
        account.setUpdatedAt(Instant.now().toString());
        return accountRepository.save(account);
    }

    @Transactional
    public void changePassword(String accountId, String currentPassword, String newPassword, String confirmPassword) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        if (newPassword == null || !newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("New password and confirm password do not match.");
        }
        validatePasswordStrength(newPassword);

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setSessionVersion(account.getSessionVersion() + 1);
        account.setUpdatedAt(Instant.now().toString());
        accountRepository.save(account);
    }

    @Transactional
    public Account toggleUserStatus(String actorId, String targetId, boolean active) {
        if (actorId.equals(targetId) && !active) {
            throw new IllegalArgumentException("You cannot deactivate your own active administrator account.");
        }
        Account target = accountRepository.findById(targetId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));
        target.setActive(active);
        target.setSessionVersion(target.getSessionVersion() + 1);
        target.setUpdatedAt(Instant.now().toString());
        return accountRepository.save(target);
    }
}
