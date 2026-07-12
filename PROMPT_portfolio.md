# ROLE
You are a senior full-stack engineer. Build a complete, production-ready **personal portfolio web application** for me based on my CV (content provided at the bottom of this prompt). Do NOT use any mock/hard-coded data in the frontend — every piece of content must come from the database through the API.

# TECH STACK (mandatory)
- **Backend:** Java 21, Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security, Validation), Flyway for DB migrations, springdoc-openapi for Swagger UI.
- **Database:** Supabase (PostgreSQL). Connect from Spring Boot via the Supabase Postgres connection string (JDBC). Use Supabase Storage for images (avatar, project screenshots) — files uploaded through the backend using the Supabase Storage REST API with the service_role key kept server-side only.
- **Frontend:** Angular 18+ (standalone components, signals, lazy-loaded routes), TailwindCSS, Angular Animations. No jQuery.

# ARCHITECTURE
- Monorepo with two folders: `/backend` and `/frontend`.
- Backend layered: controller → service → repository → entity, with DTOs + MapStruct (never expose entities directly).
- Global exception handler returning a consistent JSON error envelope `{timestamp, status, message, errors[]}`.
- All configuration (DB url, JWT secret, Supabase keys, CORS origins) via environment variables — provide a `.env.example` and `application.yml` that reads from env vars. Never commit secrets.
- Provide `README.md` with step-by-step local setup (Supabase project creation, env vars, run commands) and a `docker-compose.yml` for local dev.

# DATABASE (no mock data — seed real data via Flyway)
Design tables: `profile` (name, title, summary, avatar_url, email, phone, location, social links), `skills` (name, category, proficiency 0–100, icon, sort_order), `experiences` (company, role, start_date, end_date, description, tech_stack[], sort_order), `projects` (name, description, tech_stack[], image_url, demo_url, repo_url, featured, sort_order), `education` (school, degree, start/end, description), `certifications` (name, issuer, date, url), `contact_messages` (name, email, subject, message, created_at, is_read), `users` (for admin auth: email, password_hash, role).
- Flyway `V1__schema.sql` creates the schema; `V2__seed.sql` inserts ALL data extracted from my CV below, plus one admin account (bcrypt-hashed password from env or documented default that must be changed).
- Every public GET endpoint reads from these tables; admin CRUD writes to them.

# SECURITY (complete, non-negotiable)
- Spring Security 6 with **stateless JWT**: short-lived access token (15 min) + refresh token rotation (refresh stored as httpOnly, Secure, SameSite=Strict cookie).
- Passwords hashed with **BCrypt** (strength ≥ 10).
- Role-based access: public endpoints `GET /api/v1/**` (portfolio data) and `POST /api/v1/contact`; everything under `/api/v1/admin/**` requires `ROLE_ADMIN`.
- Bean Validation on all request DTOs; sanitize inputs; JPA/parameterized queries only (no string-concatenated SQL).
- Strict CORS (allowed origin from env var), security headers (HSTS, X-Content-Type-Options, X-Frame-Options DENY, Content-Security-Policy), hide stack traces in prod.
- Rate limiting (Bucket4j): stricter on `/api/v1/auth/login` (5/min/IP) and `/api/v1/contact` (3/min/IP) to stop brute force and spam.
- Login: account lockout after 5 failed attempts (15 min), generic error messages (no user enumeration).
- File uploads: validate content type + size (≤2 MB images), randomize filenames.
- Angular side: HTTP interceptor attaching the access token, auto-refresh on 401, route guard for `/admin/**`, logout clears state and revokes the refresh token server-side.

# API (REST, versioned `/api/v1`)
- Public: `GET /profile`, `GET /skills`, `GET /experiences`, `GET /projects`, `GET /education`, `GET /certifications`, `POST /contact`.
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- Admin (full CRUD + reorder): `POST/PUT/DELETE` for every resource above, `PUT /admin/profile`, `GET/PATCH(read)/DELETE /admin/messages`, `POST /admin/upload` (image → Supabase Storage, returns public URL).
- Document everything in Swagger UI at `/swagger-ui.html`.

# FRONTEND — PUBLIC PORTFOLIO (design is the top priority)
**Visual style:** modern, elegant, **pastel blue–purple color palette** (e.g. lavender `#B8B5FF`, periwinkle `#A6B1E1`, soft violet `#C3B1E1`, pastel blue `#A8D8EA`, near-white background `#F7F5FF`, dark text `#2D2B55`). Soft gradients (blue→purple), **glassmorphism cards** (blur + translucency), rounded corners (16–24px), soft layered shadows, generous whitespace. Modern font pairing (e.g. "Plus Jakarta Sans" or "Space Grotesk" for headings, "Inter" for body). Include a **dark mode toggle** with a matching dark pastel theme, persisted in localStorage.

**Sections (single scrolling page + sticky glass navbar with smooth-scroll + active-link highlight):**
1. **Hero** — animated gradient background (slow-moving pastel blue/purple mesh or blob shapes), floating particles, my name with a **typing effect** cycling through my roles, avatar with a glowing gradient ring, CTA buttons ("View Projects", "Download CV") with hover glow, animated scroll-down indicator.
2. **About** — summary with fade-in, quick stats (years of experience, projects) with animated count-up when scrolled into view.
3. **Skills** — grouped by category, animated proficiency bars that fill on scroll, hover tilt/lift on skill cards, staggered reveal.
4. **Experience** — vertical **timeline** with gradient line, dots that pulse, cards sliding in alternately from left/right on scroll.
5. **Projects** — responsive card grid, image zoom + gradient overlay on hover, tech-stack chips, filter by technology with animated re-layout, links to demo/repo.
6. **Education & Certifications** — clean cards with reveal animations.
7. **Contact** — glassmorphism form (floating labels, real-time validation, success/error toast — saves to DB via `POST /contact`), social icons with hover animations.
8. **Footer** — minimal, gradient top border, back-to-top floating button.

**Animation & UX requirements:** scroll-reveal (IntersectionObserver) with staggering; smooth micro-interactions on every interactive element (150–300 ms ease); subtle parallax in hero; animated route transitions; skeleton loaders while fetching from the API (never a blank screen, no layout shift); custom scrollbar; respects `prefers-reduced-motion`. Keep it 60 fps — animate only transform/opacity.

**Responsive:** flawless on mobile (≥360px), tablet, desktop; hamburger menu with slide-in glass drawer on mobile; fluid typography with clamp(); Lighthouse ≥ 90 for performance, accessibility, best practices, SEO (meta tags, OG tags, semantic HTML, alt text).

# FRONTEND — ADMIN PANEL (`/admin`, lazy-loaded, route-guarded)
- Beautiful login page in the same pastel style.
- Dashboard layout: collapsible sidebar (Profile, Skills, Experience, Projects, Education, Certifications, Messages), topbar with theme toggle + logout.
- Every section: data table (paginated, searchable, sortable) with Create/Edit in modals or side drawers using reactive forms + validation, delete with confirmation dialog, drag-and-drop reordering (persists `sort_order`), image upload with preview (goes to Supabase Storage via the backend).
- Messages inbox: list contact messages, mark read/unread, delete, unread badge in the sidebar.
- Toast notifications for every action; optimistic UI where sensible; loading and empty states everywhere.
- All changes are immediately reflected on the public site (same API, no cache staleness — or provide cache invalidation).

# QUALITY BAR
- Clean, typed, commented code; consistent naming; no `any` in TypeScript; ESLint + Prettier configs included.
- Backend unit tests for auth and one CRUD service; frontend at least smoke tests for core components.
- Provide the complete file tree first, then generate every file fully — no placeholders like "// implement later".

# MY CV DATA (use this to seed the database — profile, skills, experiences, projects, education, certifications)

## Profile
- **Name:** Trần Vũ Thiện
- **Title:** Software Development Engineer
- **Location:** Hanoi, Vietnam
- **Email:** tranvuthien1708@gmail.com
- **Phone:** 0348741230 (Zalo: 0942457820)
- **Summary:** Software Engineer with experience in developing web applications using Java Spring Boot, Angular, and Oracle/MySQL. Experienced in working in enterprise environments, developing backend and frontend features, processing ETL data, writing optimized SQL queries, and coordinating acceptance testing with outsourcing partners. Seeking to grow toward a Full-Stack Developer / Distributed Systems Engineer career path.
- **Typing-effect roles for hero:** "Software Development Engineer", "Full-Stack Java Developer", "Spring Boot & Angular Developer"
- **Interests (for About section):** Travel, football, watching movies, learning new languages.

## Skills (grouped by category)
- **Backend:** Java (90), Spring Boot (90), REST API (90)
- **Frontend:** Angular (85), HTML (85), CSS (80)
- **Database:** Oracle (80), MySQL (85), SQL optimization (85)
- **Messaging / Integration:** Kafka (70), gRPC (70), Redis (75)
- **Tools:** Git (85), SVN (75), Postman (85), Pentaho Spoon / ETL (75), AI Coding Agents (80)

## Work Experience (newest first)
1. **Viettel Telecom** — Software Development Engineer | 08/2024 – Present
   - Developed backend and frontend features for internal business support systems using Java Spring Boot, Angular, and Oracle Database.
   - Participated in data processing and built ETL pipelines to support internal applications.
   - Wrote and optimized SQL queries to efficiently retrieve and process data from databases.
   - Coordinated with stakeholders to manage, test, and conduct acceptance of deliverables provided by outsourcing partners.
   - Contributed to the integration and operation of scalable backend components using gRPC, Kafka, and Redis.
   - Tech stack: Java, Spring Boot, Angular, Oracle, Kafka, gRPC, Redis, Pentaho
2. **Migi Technology** — Java Web Developer | 01/2023 – 07/2024
   - Developed both backend and frontend using Java Spring Boot, Angular, and MySQL for web applications in school management and e-commerce domains.
   - Tech stack: Java, Spring Boot, Angular, MySQL
3. **HCLTech Vietnam** — Java Intern | 03/2022 – 12/2022
   - Learned full-stack web application development using Java Spring Boot combined with Angular; participated in company training activities and programs.
   - Tech stack: Java, Spring Boot, Angular

## Projects (newest first; mark the first two as featured)
1. **Commission Payment System (Viettel Telecom)** | 08/2024 – Present
   - Technologies: Java Spring Boot, Oracle Database, Pentaho (ETL)
   - Maintained and enhanced backend services for the commission payment system using Spring Boot.
   - Developed and maintained ETL workflows using Pentaho Spoon to extract, transform, and load business data for reporting and internal systems.
   - Coordinated with and reviewed deliverables from outsourced partners, ensuring compliance with business requirements and technical standards.
2. **Dashboard for the Ministry of Education and Sports of Laos** | 04/2024 – 07/2024
   - Technologies: Java Spring Boot, Angular, MySQL
   - Developed both backend APIs and frontend interfaces for key modules such as Account Management and School Management.
   - Designed RESTful APIs with Spring Boot for business logic and data processing; implemented dynamic UI components with Angular.
   - Wrote and optimized MySQL queries to retrieve and process system data efficiently.
3. **Ulearn — E-commerce & Online Examination System** | 05/2023 – 03/2024
   - Technologies: Java Spring Boot, Angular, MySQL
   - Built and maintained full-stack features for modules including Course Topic Management, Seller Course Management, and Course Library.
   - Designed RESTful APIs with Spring Boot; implemented dynamic UI components with Angular.
   - Wrote and optimized MySQL queries to retrieve and process system data efficiently.

## Education
- **VNU University of Engineering and Technology** | 08/2018 – 06/2022
  - Electronics and Communications Engineering Technology
  - Major: Electronics and Telecommunications Engineering (Advanced Program)

## Certifications
- **TOEIC 855**
