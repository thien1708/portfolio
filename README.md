# Portfolio — Trần Vũ Thiện

Personal portfolio web application: a public one-page site with a pastel blue–purple design,
scroll animations and dark mode, plus a secured admin panel where every piece of content
(profile, skills, experience, projects, education, certifications, contact messages) is
managed in the database — no mock data anywhere.

| Layer    | Tech                                                                     |
| -------- | ------------------------------------------------------------------------ |
| Backend  | Java 21 · Spring Boot 3.5 · Spring Security 6 (JWT) · JPA · Flyway       |
| Frontend | Angular 20 (standalone, signals) · TailwindCSS 3 · Angular CDK           |
| Database | Supabase (PostgreSQL) — H2 file DB for the zero-setup local profile      |
| Storage  | Supabase Storage (images) — local `./uploads` folder in the local profile |

---

## 🚀 Quick start (không cần Docker / Supabase)

Chạy ngay trên máy chỉ cần **JDK 21+** và **Node 20+**:

```bash
# Terminal 1 — backend (H2 file DB, dữ liệu CV được seed sẵn qua Flyway)
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 2 — frontend (dev server, proxy /api → localhost:8080)
cd frontend
npm install
npx ng serve
```

- Public site: <http://localhost:4200>
- Admin panel: <http://localhost:4200/admin> — đăng nhập `tranvuthien1708@gmail.com` / `Admin@123`
  (mật khẩu dev mặc định của profile local — **đổi ngay khi deploy**)
- Swagger UI: <http://localhost:8080/swagger-ui.html>

---

## Connecting to Supabase (production setup)

1. **Create a project** at <https://supabase.com> (free tier is enough).
2. **Database credentials** — Dashboard → *Project Settings* → *Database* → *Connection string*.
   Use the **Session pooler** URI (port `5432`, IPv4-friendly) and convert it to JDBC form:

   ```
   DATABASE_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres
   DATABASE_USERNAME=postgres.<project-ref>
   DATABASE_PASSWORD=<your-db-password>
   ```

3. **Storage bucket** — Dashboard → *Storage* → *New bucket* → name `portfolio`, tick **Public**.
   Then grab from *Project Settings* → *API*:

   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # server-side only, never expose
   SUPABASE_STORAGE_BUCKET=portfolio
   ```

4. Copy `.env.example` → `.env`, fill everything in (including a strong `JWT_SECRET`
   and `ADMIN_PASSWORD`), then run the backend **without** the local profile:

   ```bash
   cd backend
   ./mvnw spring-boot:run          # reads env vars; Flyway creates + seeds the schema
   ```

   On Windows PowerShell, load the `.env` first or set the variables via
   *System Environment Variables*. With Docker, `docker compose` reads `.env` automatically.

5. Flyway runs `V1__schema.sql` + `V2__seed.sql` against Supabase on first start —
   the site is immediately live with the CV data, and the admin account is created
   from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Docker (optional)

```bash
cp .env.example .env   # edit values, or keep defaults for a fully local stack
docker compose up --build
# → http://localhost:8081  (public)   http://localhost:8081/admin  (admin)
```

The compose file bundles PostgreSQL; point `DATABASE_URL` at Supabase in `.env`
to use the managed database instead.

---

## API overview (`/api/v1`, Swagger at `/swagger-ui.html`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/profile`, `/skills`, `/experiences`, `/projects`, `/education`, `/certifications` | public | Portfolio content |
| POST | `/contact` | public (rate-limited 3/min/IP) | Save a contact message |
| POST | `/auth/login` | public (rate-limited 5/min/IP) | Returns access token + sets refresh cookie |
| POST | `/auth/refresh` | refresh cookie | Rotates the refresh token |
| POST | `/auth/logout` | refresh cookie | Revokes the refresh token |
| PUT | `/admin/profile` | ADMIN | Update profile |
| POST/PUT/DELETE | `/admin/{skills\|experiences\|projects\|education\|certifications}[/{id}]` | ADMIN | CRUD |
| PUT | `/admin/{resource}/reorder` | ADMIN | Persist drag-and-drop order |
| GET/PATCH/DELETE | `/admin/messages…` | ADMIN | Inbox: list, mark read, delete |
| POST | `/admin/upload` | ADMIN | Image upload → Supabase Storage / local disk |

## Security model

- **Stateless JWT** access tokens (15 min) signed with `JWT_SECRET` (HS384, ≥32 chars).
- **Refresh token rotation**: 7-day opaque tokens stored **hashed (SHA-256)** in the DB and
  delivered as an `httpOnly` + `Secure` + `SameSite=Strict` cookie scoped to `/api/v1/auth`.
  Reusing a rotated token revokes the whole token family (theft detection).
- **BCrypt (cost 12)** password hashing; account **lockout 15 min after 5 failed logins**;
  identical error messages and dummy-hash timing to prevent user enumeration.
- **Role-based access**: everything under `/api/v1/admin/**` requires `ROLE_ADMIN`;
  all other routes are explicitly whitelisted, `anyRequest().denyAll()`.
- **Rate limiting** (Bucket4j, per IP): login 5/min, contact 3/min, general API 120/min.
- **Bean Validation** on every request DTO; JPA parameterized queries only.
- **Headers**: HSTS, `X-Frame-Options: DENY`, CSP, no stack traces in responses.
- **CORS** locked to `CORS_ALLOWED_ORIGINS`; secrets only via environment variables.
- **Uploads**: images only (whitelist + content-type check), ≤2 MB, randomized filenames;
  the Supabase `service_role` key never leaves the backend.

## Project structure

```
├── backend/                  Spring Boot API
│   └── src/main/
│       ├── java/com/tranvuthien/portfolio/
│       │   ├── config/       Security, CORS, OpenAPI, admin bootstrap, static files
│       │   ├── security/     JwtService, JWT filter, rate-limit filter
│       │   ├── domain/       JPA entities
│       │   ├── repository/   Spring Data repositories
│       │   ├── dto/          Request/response records (+ validation)
│       │   ├── service/      Business logic, storage (Supabase / local)
│       │   └── web/          Public, auth and admin controllers + error handler
│       └── resources/db/migration/   V1__schema.sql, V2__seed.sql (CV data)
├── frontend/                 Angular 20 + Tailwind
│   └── src/app/
│       ├── core/             API services, auth, interceptor, theme, toasts
│       ├── shared/           Reveal/count-up directives, chips input, toast outlet
│       ├── pages/home/       Public site (hero, skills, timeline, projects, …)
│       └── admin/            Login, layout, generic CRUD, profile, messages
├── docker-compose.yml        Postgres + backend + frontend (nginx)
└── .env.example              All required environment variables
```

## Deploy: Render (backend) + Netlify (frontend)

Both platforms deploy from a GitHub repository containing this whole folder.

**1. Supabase (once)** — create the project, note the Session-pooler DB credentials,
create a **public** Storage bucket named `portfolio` (see section above).

**2. Backend → Render** (`render.yaml` is already included):

- Dashboard → **New → Blueprint** → select this repo → Render picks up `render.yaml`.
- Fill the prompted env vars: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`,
  `ADMIN_PASSWORD`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
  `CORS_ALLOWED_ORIGINS` = your Netlify URL (e.g. `https://your-site.netlify.app`).
  `JWT_SECRET` is generated automatically.
- First start runs Flyway against Supabase (schema + CV seed data) and creates the
  admin account. Note your service URL: `https://portfolio-backend-xxxx.onrender.com`.
- Free plan sleeps after 15 min idle — the first request may take ~1 min to wake up.

**3. Frontend → Netlify** (`netlify.toml` is already included):

- Edit `netlify.toml` first: replace `RENDER_BACKEND_URL.onrender.com` with your real
  Render URL (both the `/api/*` and `/uploads/*` rules), commit + push.
- Dashboard → **Add new site → Import an existing project** → select this repo.
  Netlify reads everything from `netlify.toml` (base `frontend`, Node 22, publish dir).
- The `/api/*` proxy makes the site and API same-origin, so cookies and CORS
  work exactly like local dev. After the first deploy, set the final Netlify URL
  in Render's `CORS_ALLOWED_ORIGINS` if it changed.

**4. Smoke test**: open `https://your-site.netlify.app` (data loads from Supabase),
log in at `/admin`, edit something, refresh the public page.

## Tests

```bash
cd backend && ./mvnw test        # auth (lockout, rotation, reuse detection) + CRUD service
cd frontend && npx ng test       # component smoke tests (needs Chrome)
```
