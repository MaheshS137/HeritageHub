package com.heritagehub.security;

import com.heritagehub.model.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final SessionVersionFilter sessionVersionFilter;

    public SecurityConfig(SessionVersionFilter sessionVersionFilter) {
        this.sessionVersionFilter = sessionVersionFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationSuccessHandler roleSuccessHandler() {
        return (request, response, authentication) -> {
            if (authentication.getPrincipal() instanceof CustomUserDetails details) {
                Role role = details.getRole();
                if (role == Role.ADMIN) {
                    response.sendRedirect("/dashboard/admin");
                    return;
                }
                if (role == Role.JOURNALIST) {
                    response.sendRedirect("/dashboard/journalist");
                    return;
                }
            }
            response.sendRedirect("/dashboard/user");
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/", "/explore", "/culture", "/culture/**",
                                "/district/**", "/article/**", "/about",
                                "/auth", "/login", "/register", "/register/**",
                                "/setup-admin", "/forgot-password", "/forgot-password/**",
                                "/api/districts/**", "/api/culture/**", "/api/heritage/**",
                                "/data/**", "/css/**", "/js/**", "/images/**", "/uploads/**", "/error"
                        ).permitAll()
                        .requestMatchers("/dashboard/user/**").hasRole("USER")
                        .requestMatchers("/dashboard/journalist/**").hasRole("JOURNALIST")
                        .requestMatchers("/dashboard/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/auth")
                        .loginProcessingUrl("/auth/login")
                        .usernameParameter("email")
                        .passwordParameter("password")
                        .successHandler(roleSuccessHandler())
                        .failureUrl("/auth?error=credentials")
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/auth?logout=1")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .addFilterAfter(sessionVersionFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
