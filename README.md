# HeritageHub — Discover Karnataka. Preserve its Heritage.

An interactive **Karnataka Cultural Heritage Preservation and Discovery Platform** pairing a 31-district GeoJSON & monument atlas, a 7-category verified cultural archive, role-based authentication (**User**, **Journalist**, **Admin**), security-question password recovery, and multilingual support (**English**, **ಕನ್ನಡ**, **हिन्दी**) in the Karnataka Red & Yellow visual identity (`#F8C928`, `#C92332`, `#941D2A`, `#FFFDF7`, `#292522`).

---

## Architecture Overview

The repository contains two complete, synchronized full-stack implementations backed by SQLite so you can export and run either stack locally in VS Code:

1. **Full-Stack Express + SQLite + React SPA (Repository Root, Port `3000`)**
   - **Backend (`server.ts`, `server/`)**: Express 4, Node 22 native SQLite (`node:sqlite` / `DatabaseSync`), `bcryptjs`, `helmet`, `express-rate-limit`, `multer`, HMAC-SHA256 signed HTTP-only session cookies with `session_version` revocation.
   - **Frontend (`src/`)**: React 19, TypeScript, Vite, Tailwind CSS v4, Leaflet GeoJSON map (`KarnatakaInteractiveMap`), `I18nContext` (`en`, `kn`, `hi`), `AuthContext`, protected role dashboards.
   - **Data & Media (`public/data/`, `public/locales/`, `public/images/`, `public/uploads/`)**: Verified JSON records, GeoJSON boundaries, translation bundles, bespoke district monument photography, and uploaded article/monument assets.

2. **Java 21 + Spring Boot 3.4.2 + Spring Security + JPA + SQLite + Thymeleaf (`/heritagehub-springboot/`, Port `8080`)**
   - **Backend (`src/main/java/com/heritagehub/`)**: Spring Boot 3.4.2, Spring Security 6 (`BCryptPasswordEncoder`, `SessionVersionFilter`, role-based `SecurityFilterChain`), Spring Data JPA, Hibernate `SQLiteDialect`, `org.xerial:sqlite-jdbc`.
   - **Frontend (`src/main/resources/templates/`)**: Server-rendered Thymeleaf views (`index.html`, `explore.html`, `culture.html`, `district.html`, `article.html`, `auth.html`, `forgot-password.html`, `dashboard-user.html`, `dashboard-journalist.html`, `dashboard-admin.html`) plus Leaflet map (`karnataka-map.js`) and `messages*.properties` (`en`, `kn`, `hi`).

---

## Environment Variables Setup

Copy `.env.example` to `.env` before running locally in VS Code. **Never commit secrets or hardcode API keys.**

```bash
cp .env.example .env
```

Available variables in `.env.example`:

- `PORT` — HTTP port for the Express + Vite server (default: `3000`)
- `SESSION_SECRET` — HMAC secret used to sign HTTP-only session cookies (override with a strong random string in production/local `.env`)
- `HERITAGEHUB_DB_PATH` — Path to the SQLite database file (default: `./heritagehub.db`)

---

## Running Locally in VS Code

### Option A: Express + SQLite + React Full-Stack Application (Port 3000)

Prerequisites: **Node.js 22+** (for native `node:sqlite`) and **npm**.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start unified full-stack Express + SQLite + Vite dev server
npm run dev
```

Open **http://localhost:3000**.

#### Running Frontend, Backend & SQLite Independently (Option A)

- **SQLite Database**: Automatically initialized by `server/db.ts` at `$HERITAGEHUB_DB_PATH` (default `./heritagehub.db`). You can inspect it with the VS Code **SQLite Viewer** extension or `sqlite3 heritagehub.db ".tables"`.
- **Production Backend + Built Frontend**:
  ```bash
  npm run build      # Compiles React SPA to dist/
  npm run start      # Serves API + built SPA on port 3000 (NODE_ENV=production)
  ```
- **Type Check / Lint**:
  ```bash
  npm run lint       # Runs tsc --noEmit across frontend and backend
  ```

---

### Option B: Java 21 Spring Boot + Spring Security + SQLite (Port 8080)

Prerequisites: **Java 21 (JDK 21+)** and **Apache Maven 3.9+**.

```bash
cd heritagehub-springboot

# 1. Run unit & MockMvc security/workflow tests
mvn test

# 2. Run the Spring Boot server with SQLite persistence
mvn spring-boot:run
```

Open **http://localhost:8080**.

- **Spring Boot SQLite Database**: Stored at `heritagehub-springboot/heritagehub.db` (override via `HERITAGEHUB_DB_PATH=/path/to/db.sqlite`). Schema tables (`accounts`, `security_credentials`, `articles`, `monuments`, `user_favorite_monuments`, `user_favorite_districts`, `user_recent_views`) are created automatically by Hibernate JPA (`spring.jpa.hibernate.ddl-auto=update`).

---

## Implemented Workflows & Security Model

1. **Role-Based Auth Portal (`/auth`)**
   - **User**: Register & login with personal emails (`gmail.com`, `outlook.com`, `yahoo.com`, etc.), full name, strong password (`8+` chars, upper, lower, digit, symbol), and security question/answer.
   - **Journalist**: Register with a short professional introduction (`bioIntro`), security question/answer, and login to open `/dashboard/journalist`.
   - **Controlled Admin Creation**:
     - When `0` admins exist in SQLite, `/auth` unlocks a **one-time Initial Admin Setup** form.
     - Once the founding admin exists, public admin setup is permanently locked (`403 Forbidden`), and subsequent admins can only be created by an authenticated Admin inside `/dashboard/admin`.
     - Server routes strip/reject any client-supplied role tampering.
2. **Security-Question Password Recovery (`/forgot-password`)**
   - Enter registered email -> Answer normalized & BCrypt-verified security question (5-attempt / 15-minute lockout protection) -> Set new strong password -> Server increments `session_version` to immediately invalidate all existing active sessions.
3. **Role Dashboards**
   - `/dashboard/user`: Profile & language settings, change password, saved favourite monuments & districts, recently viewed places.
   - `/dashboard/journalist`: Create/edit drafts, upload cover photography, choose district & category, submit/resubmit for review (`DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PUBLISHED`), view admin feedback. Journalists cannot self-approve or publish.
   - `/dashboard/admin`: Live counts, search/activate/deactivate users & journalists, create additional admins, review & approve/reject/publish journalist articles, monument CRUD + image upload, cultural records & district controls.
4. **Multilingual UI & Heritage Archive (`EN | ಕನ್ನಡ | हिन्दी`)**
   - Language switcher in the header persists to `localStorage` for guests and syncs to SQLite for signed-in accounts.
   - Dynamic/unverified entries display a clear fallback notice when an audited translation is unavailable.

---

## Geospatial & Cultural Data Sources & Licenses

1. **Karnataka District Boundaries (`karnataka-districts.geojson`)**
   - **Dataset**: geoBoundaries `IND-ADM2-76128533` (`boundaryYearRepresented: 2021`, sourced from `Pathways Data Pvt. Ltd., lgdirectory.gov.in`).
   - **License**: **Open Data Commons Open Database License 1.0 (ODbL 1.0)**.
2. **Cultural & Monument Records**
   - **UNESCO World Heritage Centre**: Hampi (Ref. 241), Pattadakal (Ref. 239), Sacred Ensembles of the Hoysalas (Ref. 1670).
   - **IP India Geographical Indications Registry**: Bidriware (No. 21), Mysore Silk (No. 22), Channapatna Toys & Dolls (No. 23), Mysore Traditional Paintings (No. 32), Dharwad Peda (No. 80).
   - **Sangeet Natak Akademi, KSTDC & Karnataka Forest Department**: Yakshagana, Dollu Kunitha, Mysuru Dasara, and Kodagu Devarakadu sacred groves.
