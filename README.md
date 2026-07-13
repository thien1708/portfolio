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

## 🚢 Hướng dẫn deploy chi tiết: Render (backend) + Netlify (frontend)

Kiến trúc khi deploy:

```
Trình duyệt ──► Netlify (Angular static site)
                  │  proxy /api/* (đã cấu hình trong netlify.toml)
                  ▼
                Render (Spring Boot, Docker) ──► Supabase (PostgreSQL + Storage)
```

Nhờ Netlify proxy `/api/*` về Render, trình duyệt luôn gọi API **cùng origin** với
trang web → cookie đăng nhập (`SameSite=Strict`) và CORS hoạt động y hệt local,
không cần sửa bất kỳ dòng code frontend nào.

### Bước 0 — Đẩy code lên GitHub

Cả Render và Netlify đều deploy từ GitHub. Repo git đã được khởi tạo sẵn ở thư mục
gốc, chỉ cần:

1. Tạo repo mới trên <https://github.com/new> (chọn **Private** nếu không muốn lộ
   số điện thoại trong file CV PDF — hoặc xoá file CV khỏi repo:
   `git rm --cached "CV Eng_TranVuThien.pdf" && git commit -m "remove CV"`).
2. Push:

   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

### Bước 1 — Tạo project Supabase (database + storage)

1. Vào <https://supabase.com> → **New project** → đặt tên, chọn region gần
   (Singapore `ap-southeast-1` cho VN), đặt **Database Password** (lưu lại!).
2. **Lấy connection string**: *Project Settings → Database → Connection string*,
   chọn tab **Session pooler** (⚠️ đừng dùng *Direct connection* — chỉ hỗ trợ IPv6,
   Render sẽ không kết nối được; cũng đừng dùng *Transaction pooler* port 6543 —
   không tương thích prepared statements của JDBC). Chuỗi có dạng:

   ```
   postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

   Tách nó thành 3 giá trị cho Render:

   | Biến | Giá trị từ chuỗi trên |
   | --- | --- |
   | `DATABASE_URL` | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` (thêm tiền tố `jdbc:`, bỏ phần user/password) |
   | `DATABASE_USERNAME` | `postgres.abcdefghijk` |
   | `DATABASE_PASSWORD` | mật khẩu DB bạn đặt ở bước 1 |

3. **Tạo bucket ảnh**: menu **Storage** → *New bucket* → tên `portfolio` →
   bật **Public bucket** → Create. (Ảnh avatar/project do admin upload sẽ nằm đây.)
4. **Lấy API keys**: *Project Settings → API*:
   - `SUPABASE_URL` = `https://<project-ref>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = key **service_role** (mục *Project API keys*).
     ⚠️ Key này có toàn quyền — chỉ đặt trên Render, không bao giờ đưa vào frontend.

### Bước 2 — Deploy backend lên Render

1. Vào <https://dashboard.render.com> → **New → Blueprint** → **Connect** repo
   GitHub vừa push. Render tự đọc file `render.yaml` và hiện form các biến cần điền.
2. Điền các biến (bảng dưới); `JWT_SECRET` được Render **tự sinh ngẫu nhiên**,
   không cần điền:

   | Biến | Điền gì |
   | --- | --- |
   | `DATABASE_URL` | chuỗi JDBC ở Bước 1.2 |
   | `DATABASE_USERNAME` | `postgres.<project-ref>` |
   | `DATABASE_PASSWORD` | mật khẩu DB |
   | `ADMIN_PASSWORD` | mật khẩu đăng nhập trang `/admin` — **đặt mạnh** |
   | `CORS_ALLOWED_ORIGINS` | điền tạm `https://placeholder.netlify.app`, sửa lại ở Bước 4 |
   | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | key service_role |
   | `MAIL_USERNAME` | Gmail dùng để gửi thông báo khi có người liên hệ — để trống nếu không cần |
   | `MAIL_PASSWORD` | **App Password** 16 ký tự của Gmail (Google Account → Security → 2-Step Verification → App passwords), *không phải* mật khẩu Gmail thường |

3. **Apply / Deploy** và mở tab **Logs**. Lần build đầu mất ~5–10 phút (Docker
   build Maven). Deploy thành công khi log có:

   ```
   Successfully applied 2 migrations ...   ← Flyway đã tạo schema + seed dữ liệu CV lên Supabase
   Admin user 'tranvuthien1708@gmail.com' created.
   Started PortfolioBackendApplication
   ```

4. Ghi lại **URL của service** hiển thị đầu trang, dạng
   `https://portfolio-backend-xxxx.onrender.com`. Kiểm tra nhanh:
   mở `https://portfolio-backend-xxxx.onrender.com/api/v1/health` → `{"status":"UP"}`
   và `/api/v1/profile` → JSON dữ liệu CV.

### Bước 3 — Trỏ Netlify proxy về Render rồi deploy frontend

1. Mở file **`netlify.toml`** ở gốc repo, thay `RENDER_BACKEND_URL.onrender.com`
   bằng URL Render thật ở **cả 2 chỗ** (`/api/*` và `/uploads/*`):

   ```toml
   to = "https://portfolio-backend-xxxx.onrender.com/api/:splat"
   ```

   Commit + push:

   ```bash
   git add netlify.toml && git commit -m "point netlify proxy to render" && git push
   ```

2. Vào <https://app.netlify.com> → **Add new site → Import an existing project**
   → chọn repo GitHub. Netlify tự đọc `netlify.toml` (base `frontend`, Node 22,
   build `npm run build`, publish `dist/frontend/browser`) — **không cần chỉnh gì**,
   bấm **Deploy**.
3. Xong sẽ có URL dạng `https://<tên-ngẫu-nhiên>.netlify.app`. Đổi tên đẹp hơn tại
   *Site configuration → Site details → Change site name*
   (vd `tranvuthien.netlify.app`).

### Bước 4 — Cập nhật CORS trên Render

Quay lại Render → service `portfolio-backend` → **Environment** → sửa
`CORS_ALLOWED_ORIGINS` = đúng URL Netlify cuối cùng (vd
`https://tranvuthien.netlify.app`) → **Save** (service tự restart).

### Bước 5 — Kiểm tra sau deploy

- [ ] Mở site Netlify: hero hiện tên + hiệu ứng gõ chữ, skills/projects load từ Supabase
- [ ] Gửi thử form **Contact** → báo thành công
- [ ] Vào `/admin`, đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` đã đặt trên Render
- [ ] Thấy tin nhắn contact vừa gửi trong mục **Messages**
- [ ] Sửa một skill / upload avatar → refresh trang public thấy thay đổi ngay
- [ ] Ảnh upload có URL dạng `https://<project-ref>.supabase.co/storage/v1/object/public/portfolio/...`

### Sự cố thường gặp

| Triệu chứng | Nguyên nhân & cách xử lý |
| --- | --- |
| Request đầu tiên chờ ~1 phút | Render **free tier ngủ sau 15 phút** không có traffic. Bình thường; nâng plan Starter nếu muốn luôn thức. |
| Log Render: `The connection attempt failed` / `UnknownHostException` | Dùng nhầm *Direct connection* (IPv6). Đổi sang **Session pooler** port 5432 như Bước 1.2. |
| Log Render: lỗi `prepared statement "S_1" already exists` | Dùng nhầm *Transaction pooler* (port 6543). Đổi sang **Session pooler** port 5432. |
| Form contact / login trả lỗi CORS hoặc 403 `Invalid CORS request` | `CORS_ALLOWED_ORIGINS` trên Render chưa đúng URL Netlify (phải có `https://`, không có `/` cuối). |
| Login được nhưng refresh trang bị văng ra | Kiểm tra đã truy cập qua **https** của Netlify (cookie có cờ `Secure`), và `/api/*` proxy trong `netlify.toml` trỏ đúng URL Render. |
| Upload ảnh lỗi `Supabase storage is not configured` | Thiếu `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` trên Render. |
| Upload xong ảnh không hiển thị | Bucket `portfolio` chưa bật **Public**. Vào Supabase → Storage → bucket → Edit → Public. |
| Netlify build fail vì Node version | `netlify.toml` đã ghim `NODE_VERSION=22`; đừng override trong UI Netlify. |
| Đổi mật khẩu admin | Đổi `ADMIN_PASSWORD` trên Render chỉ áp dụng khi user **chưa tồn tại**. Cách nhanh: xoá dòng trong bảng `users` (Supabase → Table Editor) rồi restart service để tạo lại từ env. |

## Tests

```bash
cd backend && ./mvnw test        # auth (lockout, rotation, reuse detection) + CRUD service
cd frontend && npx ng test       # component smoke tests (needs Chrome)
```
