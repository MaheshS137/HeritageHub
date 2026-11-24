# HeritageHub — Role-Based Authentication, Dashboards & Multilingual Platform Upgrade

Upgrade HeritageHub with a persistent SQLite-backed authentication and role-based access control system (`USER`, `JOURNALIST`, `ADMIN`), security-question password recovery, three dedicated role dashboards with article review and content management workflows, and centralized English / Kannada (`ಕನ್ನಡ`) / Hindi (`हिन्दी`) multilingual support—preserving the Karnataka Red & Yellow visual identity and interactive 31-district monument map.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions confirmed during clarification guide this implementation:

- **Initial Admin Bootstrap**: A dedicated one-time **Initial Admin Setup** workflow is active only when zero `ADMIN` accounts exist in the database. Once the first administrator is created, the setup route automatically locks, and all subsequent admin accounts can only be provisioned by an authenticated `ADMIN` inside the Admin Dashboard.
- **Role-Based Auth Entry**: A unified **Sign In / Register** portal presents three distinct role cards (**User**, **Journalist**, **Admin**), each opening tailored login and registration fields while enforcing strict server-side role boundaries.
- **Multilingual Scope**: Centralized UTF-8 translation bundles cover all UI chrome, navigation, forms, validation alerts, dashboards, and categories, alongside **verified Kannada and Hindi translations** for curated monuments, districts, and cultural records—explicitly falling back to English (with clear provenance) whenever a translation is unavailable.
- **Dual-Codebase Integration**: Upgrades both the **live Express + SQLite + React** application running on port `3000` and the **Java 21 + Spring Boot 3.x + Spring Security + Spring Data JPA + SQLite + Thymeleaf** backend and templates in full architectural parity.

---

## 1. Overview & Core Concept

- **What It Delivers**: Transitions HeritageHub from a read-only digital archive into a multi-role cultural preservation platform. Visitors explore Karnataka's 31 districts in English, Kannada, or Hindi; registered community users curate saved monuments and districts; journalists author and submit district heritage articles with photographs; and administrators govern accounts, review submissions, and manage live monument/festival/category records.
- **Target Personas**:
  - **Public User (`USER`)**: Students, travelers, and enthusiasts who bookmark favorite monuments and districts, browse recent history, and save preferred language settings.
  - **Cultural Journalist (`JOURNALIST`)**: Field researchers and writers who draft, photograph, submit, and revise cultural heritage articles tied to specific Karnataka districts and categories.
  - **Platform Administrator (`ADMIN`)**: Archival stewards who moderate user and journalist accounts, approve/reject/publish submitted articles with editorial feedback, and maintain verified monument, festival, district, and category records.
- **Key Value**: Enforces genuine server-side security (BCrypt password and answer hashing, anti-enumeration recovery, rate-limited security answers, session invalidation on password reset, and strict role authorization) paired with seamless multilingual accessibility.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Multilingual Switching (Navbar + Profile Sync)**:
   - A compact language switcher (`EN` · `ಕನ್ನಡ` · `हिन्दी`) resides cleanly in both the desktop top bar action cluster and the mobile navigation drawer without breaking the single-row header rhythm.
   - Switching languages immediately updates navigation links, hero copy, interactive map panels, categories, forms, validation messages, dashboards, footer content, and verified cultural records.
   - Guest choices persist in local storage/cookies; authenticated users automatically synchronize their language preference to their database profile.
2. **Three-Card Authentication & One-Time Admin Setup**:
   - Clicking **Account / Sign In** opens the Role Portal featuring three clean editorial role cards (**Community Explorer**, **Heritage Journalist**, **Archive Administrator**).
   - Selecting a card reveals role-appropriate Login, Registration (personal emails like Gmail, Outlook, Yahoo accepted across all roles), or **Forgot Password** tabs with password visibility toggles, real-time strength meters, and loading/alert banners.
   - If zero admins exist on first run, an **Initial Admin Setup** banner guides creation of the founding administrator; attempting to inject `role=ADMIN` through ordinary registration is rejected server-side.
3. **Security-Question Password Recovery**:
   - **Step 1–2**: User selects Forgot Password and enters their registered email address.
   - **Step 3**: System displays the security question linked to the account (using rate-limited, neutral non-enumerating guidance if no account matches).
   - **Step 4**: User submits their security answer (normalized case/whitespace and verified against the stored BCrypt hash; 5 failed attempts trigger a temporary 15-minute cooldown).
   - **Step 5–7**: On verification, user enters and confirms a strong new password; the backend stores the new BCrypt hash, increments the user's session version to revoke all active sessions immediately, and confirms success.
4. **Role-Specific Dashboards**:
   - **User Dashboard**: Personalized welcome banner, editable profile details, secure change-password form, **Saved Favourite Monuments** grid (linked with one-click bookmarking on map panels and monument pages), **Saved Districts**, **Recently Viewed Locations**, language selector, and sign-out.
   - **Journalist Dashboard**: Author profile summary, interactive article composer (title, short summary, full body, Karnataka district selector, 7-category selector, image uploader/preview), status pipeline tabs (`Draft`, `Pending Review`, `Approved`, `Rejected`, `Published`), admin feedback callouts on rejected drafts, and resubmit action. Approval/publish actions are strictly hidden and server-blocked for journalists.
   - **Admin Dashboard**: Tabular numeral KPI strip (Total Users, Total Journalists, Total Districts, Total Monuments, Pending Articles, Published Articles), searchable **User & Journalist Directory** (inspect profile, activate/deactivate accounts, create new Admin accounts), **Article Review Queue** (approve, reject with mandatory feedback note, publish approved articles), and **Heritage Content Manager** (create/edit/delete monuments, upload monument photos, edit district summaries, festivals, and categories).

### Visual Identity & Theme

- **Aesthetic Direction**: Museum & Editorial warmth paired with clean SaaS Dashboard legibility—single-elevation hairline-bordered surfaces (`1px solid #EADEC8`), generous whitespace, and zero nested card clutter or decorative pill badges.
- **Karnataka Red & Yellow Palette**:
  - Primary Canvas: Warm Ivory (`#FFFDF7`) and Warm Sand (`#FBF6E8`)
  - Primary Ink & Muted Ink: `#292522` and `#77716B`
  - Accents: Karnataka Deep Red (`#C92332`), Dark Red (`#941D2A`), Primary Yellow (`#F8C928`), Charcoal (`#201C1B`), Pure White (`#FFFFFF`)
  - Semantic Feedback (paired with text labels & icons): Success emerald, warning amber, error crimson—never conveyed by hue alone.
- **Typography & Script Rendering**:
  - Latin Display & Body: `Playfair Display` + `DM Sans`
  - Multilingual Script Support: `Noto Sans Kannada` and `Noto Sans Devanagari` loaded globally with UTF-8 encoding so Kannada and Hindi scripts align cleanly alongside tabular numerals (`tabular-nums`) in dashboard tables and metrics.
- **Interactive Feedback & Motion**: Smooth `200ms` transitions on role card selection, tab switches, bookmark toggles, password strength bars, upload progress indicators, and accessible focus rings (`#C92332` / `#F8C928`).

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side Session Revocation via Token Versioning**:
  - *Chosen Approach*: Store a `session_version` integer on every user account and embed it inside signed HTTP-only session cookies / Spring Security session validation. Password resets, password changes, and admin account deactivations increment `session_version`, immediately invalidating every existing session across devices.
  - *Why*: Stateless tokens alone cannot be revoked immediately after a password reset or account suspension.
- **Anti-Enumeration & Lockout Recovery Flow**:
  - *Chosen Approach*: Email lookup during password recovery normalizes responses and applies per-account/per-IP attempt counters with exponential or fixed 15-minute lockouts on incorrect security answers, while hashing normalized security answers (`trim().toLowerCase()`) using BCrypt.
  - *Why*: Prevents attackers from harvesting registered emails or brute-forcing common hometown/nickname answers.
- **Verified Multilingual Bundles with Explicit Fallback**:
  - *Chosen Approach*: Store centralized UI strings and curated cultural/monument translations in structured UTF-8 JSON dictionaries (`en`, `kn`, `hi`) served identically via a centralized `t()` helper (React) and `MessageSource` / JSON bundle service (Spring Boot). Unverified dynamic user-submitted articles fall back transparently to English without misleading machine-translation claims.
  - *Why*: Upholds HeritageHub's archival accuracy guarantee while providing rich native-script access across Kannada, Hindi, and English.
- **SQLite Persistence Synchronized with Heritage Datasets**:
  - *Chosen Approach*: Use local SQLite in both runtimes (`heritagehub.db`) seeded idempotently on startup from the existing 31-district and cultural record JSON catalogs, while exposing unified CRUD APIs for monuments, districts, categories, articles, user favorites, and recent views.
  - *Why*: Zero external database setup required for localhost/VS Code export while guaranteeing full relational integrity and persistent writes across restarts.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    HeritageHub Presentation Layer                         │
│   Navbar [Language Selector: EN · ಕನ್ನಡ · हिन्दी] · Interactive Map      │
│   Public Pages (Home, Explore, Culture, District, About)                  │
│   Auth Portal (3 Role Cards + Initial Admin Setup + Forgot Password)      │
│   Role Dashboards (User · Journalist · Admin)                             │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │ HTTPS / REST & Form Actions (UTF-8)
┌───────────────────────────────▼───────────────────────────────────────────┐
│              Unified Backend & Security Layer                             │
│   (Express + TypeScript Runtime :3000  ║  Spring Boot 3 + Spring Security)│
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ Security Middleware: BCrypt (cost >=10) · Role Guards · Rate Limiter│  │
│  │ Session / Token Version Check · Anti-Enumeration Recovery Service   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐  │
│  │ Auth & Recovery  │  │ Role Dashboards  │  │ Heritage & i18n Service │  │
│  │ - Register User  │  │ - User Profile   │  │ - Districts & Monuments │  │
│  │ - Register Journ │  │ - Favorites/Views│  │ - Categories & Festivals│  │
│  │ - Initial Admin  │  │ - Article Drafts │  │ - Image Uploads         │  │
│  │ - Security Q/A   │  │ - Admin Review   │  │ - EN / KN / HI Bundles  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬────────────┘  │
└───────────┼─────────────────────┼─────────────────────────┼───────────────┘
            │                     │                         │
┌───────────▼─────────────────────▼─────────────────────────▼───────────────┐
│                    SQLite Relational Store + Local Media                  │
│  accounts (role, active, session_version, password_hash, preferred_lang)  │
│  security_credentials (account_id, question_text, answer_hash, lockouts)  │
│  districts · monuments · categories · cultural_records                    │
│  articles (author_id, district_id, category_slug, status, admin_feedback) │
│  user_favorite_monuments · user_favorite_districts · user_recent_views    │
└───────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Security Boundaries

- **`accounts`**: Primary account identity (`id`, `full_name`, `email` unique lowercase, `password_hash`, `role` enum `USER | JOURNALIST | ADMIN`, `bio_intro`, `preferred_language` `en | kn | hi`, `active` boolean, `session_version` integer, `created_at`, `updated_at`). Passwords and hashes are strictly stripped from all DTOs and API JSON responses.
- **`security_credentials`**: One-to-one linked security recovery record (`account_id`, `question`, `answer_hash`, `failed_attempts`, `locked_until`). Supports standard preset questions plus custom user-defined questions.
- **`articles`**: Journalist-authored cultural submissions (`id`, `title`, `slug`, `short_description`, `content`, `district_id`, `category_slug`, `cover_image_url`, `author_id`, `status` enum `DRAFT | PENDING_REVIEW | APPROVED | REJECTED | PUBLISHED`, `admin_feedback`, `submitted_at`, `reviewed_at`, `published_at`). State transitions enforce that only `JOURNALIST` authors can edit `DRAFT`/`REJECTED` articles and submit for review, while only `ADMIN` users can `APPROVE`, `REJECT` (with feedback), or `PUBLISH`.
- **`monuments` / `districts` / `categories` / `cultural_records`**: Seeded idempotently from the verified JSON archive and extended with Admin CRUD operations and uploaded photography, immediately reflected on the interactive Karnataka map and Cultural Heritage catalog.
- **`user_favorite_monuments` / `user_favorite_districts` / `user_recent_views`**: Relational join tables scoped to the authenticated user for bookmarking and history tracking.

### Interactive Component & State Mapping

- **Auth Portal**: Interactive role card switcher updates active registration/login schema -> submits credentials over POST -> stores signed HTTP-only session cookie -> redirects directly to role-matched dashboard (`/dashboard/user`, `/dashboard/journalist`, or `/dashboard/admin`).
- **Password Recovery Stepper**: Email submission triggers rate-limited lookup -> returns challenge question -> answer verification mints a short-lived single-use reset token -> password update invalidates prior sessions and routes to Sign In.
- **Monument Bookmark & Recent View Sync**: Viewing a district or clicking Save on a monument card updates optimistic UI state and persists via authenticated API calls; guests receive a prompt linking to Sign In.
- **Journalist Composer & Admin Moderation**: Multipart photo uploads save locally to static media storage with size/type validation -> draft/submit transitions update database status -> Admin Approve/Reject/Publish triggers immediate status and public catalog updates.
- **Multilingual Engine**: Language selection updates React context / Spring session locale + `document.documentElement.lang`, switches font stack fallbacks, updates all UI labels and verified cultural text, and persists preference to the database for logged-in users.
