package com.heritagehub.security;

import com.heritagehub.model.Account;
import com.heritagehub.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final String accountId;
    private final String email;
    private final String passwordHash;
    private final String fullName;
    private final Role role;
    private final boolean active;
    private final int sessionVersion;

    public CustomUserDetails(Account account) {
        this.accountId = account.getId();
        this.email = account.getEmail();
        this.passwordHash = account.getPasswordHash();
        this.fullName = account.getFullName();
        this.role = account.getRole();
        this.active = account.isActive();
        this.sessionVersion = account.getSessionVersion();
    }

    public String getAccountId() { return accountId; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }
    public int getSessionVersion() { return sessionVersion; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}
