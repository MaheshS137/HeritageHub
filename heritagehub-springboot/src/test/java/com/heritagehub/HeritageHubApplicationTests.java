package com.heritagehub;

import com.heritagehub.model.Account;
import com.heritagehub.model.Article;
import com.heritagehub.model.ArticleStatus;
import com.heritagehub.model.Role;
import com.heritagehub.repository.AccountRepository;
import com.heritagehub.service.ArticleService;
import com.heritagehub.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite:target/heritagehub-test.db",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class HeritageHubApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ArticleService articleService;

    @Test
    void primaryPagesReturnOk() throws Exception {
        mockMvc.perform(get("/")).andExpect(status().isOk());
        mockMvc.perform(get("/explore")).andExpect(status().isOk());
        mockMvc.perform(get("/culture")).andExpect(status().isOk());
        mockMvc.perform(get("/district/mysuru")).andExpect(status().isOk());
        mockMvc.perform(get("/about")).andExpect(status().isOk());
        mockMvc.perform(get("/auth")).andExpect(status().isOk());
        mockMvc.perform(get("/forgot-password")).andExpect(status().isOk());
    }

    @Test
    void districtsApiReturnsAllThirtyOneDistrictsAndHandlesInvalidId() throws Exception {
        mockMvc.perform(get("/api/districts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(31)));

        mockMvc.perform(get("/api/districts/mysuru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Mysuru"))
                .andExpect(jsonPath("$.monumentName").exists());

        mockMvc.perform(get("/api/districts/vijayapura"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monumentName").value("Gol Gumbaz"))
                .andExpect(jsonPath("$.monumentLat").isNumber());

        mockMvc.perform(get("/api/districts/non-existent-district"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cultureApiFiltersByDistrictAndCategory() throws Exception {
        mockMvc.perform(get("/api/culture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(5))));

        mockMvc.perform(get("/api/culture").param("district", "mysuru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))));

        mockMvc.perform(get("/api/culture").param("category", "food-cuisine"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("food-dharwad-peda"));

        mockMvc.perform(get("/api/culture/invalid-record"))
                .andExpect(status().isNotFound());
    }

    @Test
    void rbacProtectsDashboardsAndPreventsUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/dashboard/user")).andExpect(status().is3xxRedirection());
        mockMvc.perform(get("/dashboard/journalist")).andExpect(status().is3xxRedirection());
        mockMvc.perform(get("/dashboard/admin")).andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/dashboard/admin").with(user("user@gmail.com").roles("USER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/dashboard/journalist").with(user("user@gmail.com").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void initialAdminSetupUserRegistrationJournalistWorkflowAndRecoveryWorkEndToEnd() throws Exception {
        if (accountRepository.countByRole(Role.ADMIN) == 0) {
            mockMvc.perform(post("/setup-admin")
                            .with(csrf())
                            .param("fullName", "Founding Admin")
                            .param("email", "admin.test@gmail.com")
                            .param("password", "AdminPass#2025")
                            .param("confirmPassword", "AdminPass#2025")
                            .param("securityQuestion", "What was the name of your primary school?")
                            .param("securityAnswer", "Vidya Mandir"))
                    .andExpect(status().is3xxRedirection())
                    .andExpect(redirectedUrl("/auth?role=ADMIN&mode=login"));
        }

        // Second initial-admin attempt must fail safely without adding another admin
        long adminCountBefore = accountRepository.countByRole(Role.ADMIN);
        mockMvc.perform(post("/setup-admin")
                        .with(csrf())
                        .param("fullName", "Rogue Admin")
                        .param("email", "rogue@gmail.com")
                        .param("password", "AdminPass#2025")
                        .param("confirmPassword", "AdminPass#2025")
                        .param("securityQuestion", "What was the name of your primary school?")
                        .param("securityAnswer", "Answer"))
                .andExpect(status().is3xxRedirection());
        assertEquals(adminCountBefore, accountRepository.countByRole(Role.ADMIN));

        // Register ordinary User with personal email
        mockMvc.perform(post("/register/user")
                        .with(csrf())
                        .param("fullName", "Asha Rao")
                        .param("email", "asha.rao@gmail.com")
                        .param("password", "UserPass#2025")
                        .param("confirmPassword", "UserPass#2025")
                        .param("securityQuestion", "In which city or town were you born?")
                        .param("securityAnswer", "Mysuru"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/auth?role=USER&mode=login"));

        Account savedUser = accountRepository.findByEmailIgnoreCase("asha.rao@gmail.com").orElseThrow();
        assertEquals(Role.USER, savedUser.getRole());

        // Register Journalist with short professional intro
        Account journalist = authService.registerJournalist(
                "Kiran Kulkarni",
                "kiran.press@outlook.com",
                "PressPass#2025",
                "PressPass#2025",
                "Heritage correspondent documenting Kalyana Chalukya stonework.",
                "What is the name of the first Karnataka monument or temple you visited?",
                "Pattadakal"
        );
        assertEquals(Role.JOURNALIST, journalist.getRole());

        // Journalist creates & submits an article; Admin approves and publishes it
        Article draft = articleService.saveDraft(
                journalist.getId(),
                null,
                "Sandstone Temples of Pattadakal",
                "Field notes on seventh-century Chalukya architectural syncretism.",
                "Pattadakal stands along the Malaprabha River in Bagalkot district, showcasing Dravida and Nagara temple traditions.",
                "bagalkot",
                "historical-monuments",
                "/images/hero-hampi.jpg"
        );
        Article submitted = articleService.submitForReview(journalist.getId(), draft.getId());
        assertEquals(ArticleStatus.PENDING_REVIEW, submitted.getStatus());

        Account admin = accountRepository.findAll().stream()
                .filter(a -> a.getRole() == Role.ADMIN)
                .findFirst()
                .orElseThrow();

        Article published = articleService.publish(admin.getId(), submitted.getId());
        assertEquals(ArticleStatus.PUBLISHED, published.getStatus());

        mockMvc.perform(get("/article/" + published.getSlug()))
                .andExpect(status().isOk());

        // Password recovery via security question invalidates old sessions (sessionVersion++)
        int priorVersion = savedUser.getSessionVersion();
        MvcResult step1 = mockMvc.perform(post("/forgot-password/question")
                        .with(csrf())
                        .param("email", "asha.rao@gmail.com"))
                .andExpect(status().is3xxRedirection())
                .andReturn();
        MockHttpSession recoverySession = (MockHttpSession) step1.getRequest().getSession(false);
        assertNotNull(recoverySession);

        mockMvc.perform(post("/forgot-password/verify")
                        .with(csrf())
                        .session(recoverySession)
                        .param("answer", "  MYSURU  "))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/forgot-password?step=3"));

        mockMvc.perform(post("/forgot-password/reset")
                        .with(csrf())
                        .session(recoverySession)
                        .param("newPassword", "NewUserPass#2026")
                        .param("confirmPassword", "NewUserPass#2026"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/auth?mode=login"));

        Account reloadedUser = accountRepository.findById(savedUser.getId()).orElseThrow();
        assertEquals(priorVersion + 1, reloadedUser.getSessionVersion());
    }
}
