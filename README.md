# Portfolio — Trần Vũ Thiện

Ứng dụng web portfolio cá nhân: giao diện public hiện đại với tông màu xanh - tím pastel, hiệu ứng cuộn mượt mà, dark mode, hoạt cảnh 3D ba chiều lazy-loaded, cùng trang quản trị (Admin Panel) bảo mật cao cho phép quản trị toàn bộ dữ liệu (thông tin cá nhân, kỹ năng, kinh nghiệm, dự án, học vấn, chứng chỉ, bài viết blog, tin nhắn liên hệ, thống kê truy cập) trực tiếp từ database — không dùng dữ liệu giả lập (mock data).

| Tầng | Công nghệ sử dụng |
| -------- | ------------------------------------------------------------------------ |
| Backend  | Java 21 · Spring Boot 3.5 · Spring Security 6 (JWT) · JPA · Flyway       |
| Frontend | Angular 20 (standalone, signals) · TailwindCSS 3 · Angular CDK · three.js (hero 3D, lazy chunk) |
| Database | Supabase (PostgreSQL) — H2 file DB cho profile local tiện lợi            |
| Storage  | Supabase Storage (ảnh tải lên) — thư mục local `./uploads` khi chạy local |

---

## 🚀 Khởi động nhanh (không cần Docker / Supabase)

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

- Giao diện người dùng: <http://localhost:4200>
- Trang quản trị: <http://localhost:4200/admin> — đăng nhập `tranvuthien1708@gmail.com` / `Admin@123`
  (mật khẩu dev mặc định của profile local — **hãy đổi ngay khi triển khai**)
- Tài liệu Swagger UI: <http://localhost:8080/swagger-ui.html>

> **Cổng 8080 bị chiếm?** (thường do ứng dụng khác đang chạy) Bạn có thể chạy backend trên cổng
> khác và chuyển hướng proxy của frontend theo: copy `frontend/proxy.conf.json` ra một file
> mới, đổi `8080` → cổng mới, rồi chạy:
>
> ```bash
> ./mvnw spring-boot:run -Dspring-boot.run.profiles=local "-Dspring-boot.run.arguments=--server.port=8890"
> npx ng serve --proxy-config proxy.local.json
> ```

---

## Kết nối Supabase (Cấu hình Production)

1. **Tạo project** tại <https://supabase.com> (gói miễn phí Free tier là đủ dùng).
2. **Thông tin đăng nhập database** — Dashboard → *Project Settings* → *Database* → *Connection string*.
   Chọn tab **Session pooler** (cổng `5432`, hỗ trợ IPv4) và chuyển sang định dạng JDBC:

   ```
   DATABASE_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres
   DATABASE_USERNAME=postgres.<project-ref>
   DATABASE_PASSWORD=<mat-khau-db-cua-ban>
   ```

3. **Tạo Storage bucket** — Dashboard → *Storage* → *New bucket* → đặt tên `portfolio`, tích chọn **Public bucket**.
   Sau đó lấy thông tin từ *Project Settings* → *API*:

   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # Chỉ dùng phía server, không bao giờ để lộ ra ngoài
   SUPABASE_STORAGE_BUCKET=portfolio
   ```

4. Sao chép `.env.example` → `.env`, điền đầy đủ các thông tin (bao gồm chuỗi bí mật `JWT_SECRET` mạnh
   và `ADMIN_PASSWORD`), sau đó khởi chạy backend **không dùng** profile local:

   ```bash
   cd backend
   ./mvnw spring-boot:run          # Đọc các biến môi trường; Flyway tự động tạo bảng & nạp dữ liệu seed
   ```

   Trên Windows PowerShell, hãy load file `.env` trước hoặc thiết lập biến qua *System Environment Variables*. Với Docker, `docker compose` sẽ tự động đọc file `.env`.

5. Flyway sẽ tự động chạy `V1__schema.sql` và `V2__seed.sql` trên Supabase ngay lần khởi động đầu tiên —
   website sẽ có đầy đủ dữ liệu CV và tài khoản admin được tạo tự động từ `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Khởi chạy với Docker (tùy chọn)

```bash
cp .env.example .env   # Điền các giá trị, hoặc giữ nguyên mặc định cho môi trường local
docker compose up --build
# → http://localhost:8081  (giao diện public)   http://localhost:8081/admin  (trang quản trị)
```

File docker-compose đã tích hợp sẵn container PostgreSQL; bạn có thể trỏ `DATABASE_URL` về Supabase trong file `.env` nếu muốn dùng trực tiếp database đám mây.

---

## Tổng quan API (`/api/v1`, Swagger UI tại `/swagger-ui.html`)

| Phương thức | Đường dẫn | Quyền hạn | Mô tả |
| ------ | ---- | ---- | ----------- |
| GET | `/portfolio` | Công khai | Dữ liệu portfolio tổng hợp có cache (10 phút) |
| GET | `/profile`, `/skills`, `/experiences`, `/projects`, `/education`, `/certifications` | Công khai | Dữ liệu từng phần của portfolio |
| GET | `/posts`, `/posts/{slug}` | Công khai | Danh sách bài viết blog (đã xuất bản) và chi tiết bài viết |
| POST | `/contact` | Công khai (giới hạn 3 req/phút/IP) | Gửi tin nhắn liên hệ & gửi email thông báo |
| POST | `/analytics/track` | Công khai (giới hạn 60 req/phút/IP) | Ghi nhận sự kiện truy cập (Analytics) |
| POST | `/auth/login` | Công khai (giới hạn 5 req/phút/IP) | Đăng nhập: trả về access token + set refresh cookie |
| POST | `/auth/refresh` | Cookie refresh | Xoay vòng (rotate) refresh token |
| POST | `/auth/logout` | Cookie refresh | Thu hồi (revoke) refresh token |
| PUT | `/admin/profile` | ADMIN | Cập nhật thông tin cá nhân |
| POST/PUT/DELETE | `/admin/{skills\|experiences\|projects\|education\|certifications\|posts}[/{id}]` | ADMIN | Thêm / Sửa / Xóa danh mục và bài viết blog |
| PUT | `/admin/{resource}/reorder` | ADMIN | Lưu thứ tự kéo thả hiển thị |
| GET/PATCH/DELETE | `/admin/messages…` | ADMIN | Hộp thư liên hệ: xem danh sách, đánh dấu đã đọc, xóa |
| GET | `/admin/analytics/summary` | ADMIN | Thống kê số lượt xem, người dùng và phân tích sự kiện |
| POST | `/admin/upload` | ADMIN | Tải ảnh lên → Supabase Storage / thư mục local |

## Mô hình bảo mật

- **Stateless JWT**: Access token ngắn hạn (15 phút) được ký bằng `JWT_SECRET` (HS384, độ dài ≥ 32 ký tự).
- **Refresh Token Rotation**: Token 7 ngày dạng chuỗi ngẫu nhiên không thể giải mã, được lưu trữ dưới dạng **băm SHA-256** trong database và gửi qua cookie an toàn với các cờ `httpOnly` + `Secure` + `SameSite=Strict` giới hạn trong đường dẫn `/api/v1/auth`. Việc tái sử dụng token đã xoay vòng sẽ kích hoạt cơ chế phát hiện đánh cắp và lập tức thu hồi toàn bộ chuỗi token liên quan.
- **Mã hóa mật khẩu BCrypt (cost 12)**: Tự động **khóa tài khoản 15 phút sau 5 lần đăng nhập thất bại** liên tiếp; phản hồi lỗi đồng nhất và thời gian xử lý dummy hash để chống lại tấn công dò tìm tài khoản (user enumeration).
- **Phân quyền truy cập (RBAC)**: Mọi endpoint dưới `/api/v1/admin/**` đều yêu cầu quyền `ROLE_ADMIN`; các endpoint khác được whitelist cụ thể, toàn bộ route còn lại bị từ chối mặc định (`anyRequest().denyAll()`).
- **Rate limiting** (Bucket4j, dựa theo IP): Đăng nhập tối đa 5 lần/phút, form liên hệ tối đa 3 lần/phút, API chung tối đa 120 lần/phút.
- **Kiểm thực dữ liệu Bean Validation** trên mọi Request DTO; sử dụng truy vấn tham số hóa JPA/Hibernate an toàn tuyệt đối trước SQL Injection.
- **Tiêu đề bảo mật HTTP (Security Headers)**: HSTS, `X-Frame-Options: DENY`, Content Security Policy (CSP), ẩn hoàn toàn stack trace lỗi trong response.
- **CORS** kiểm soát chặt chẽ thông qua biến `CORS_ALLOWED_ORIGINS`; bí mật hệ thống chỉ lưu qua biến môi trường.
- **Quản lý tải file**: Chỉ cho phép định dạng ảnh (kiểm tra whitelist phần mở rộng + MIME type), dung lượng tối đa ≤ 2 MB, tên file ngẫu nhiên hóa; key bí mật `service_role` của Supabase luôn nằm ở backend, không bao giờ lộ ra frontend.

## Cấu trúc dự án

```
├── backend/                  Spring Boot API
│   └── src/main/
│       ├── java/com/tranvuthien/portfolio/
│       │   ├── config/       Security, CORS, OpenAPI, admin bootstrap, cache, static files
│       │   ├── security/     JwtService, JWT filter, rate-limit filter
│       │   ├── domain/       JPA entities (Profile, Skill, Experience, Project, Post, AnalyticsEvent...)
│       │   ├── repository/   Spring Data repositories
│       │   ├── dto/          Request/response records (+ validation)
│       │   ├── service/      Business logic, storage (Supabase / local), mail (SMTP / Resend), analytics
│       │   ├── util/         Csv & Lines helpers (delimited text columns)
│       │   └── web/          Public, auth, blog, analytics and admin controllers + error handler
│       └── resources/db/migration/   V1__schema.sql, V2__seed.sql (consolidated schema + seed)
├── frontend/                 Angular 20 + Tailwind
│   └── src/app/
│       ├── core/             API services, auth, interceptor, theme, i18n (EN/VI), toasts, analytics, sound, seo
│       ├── shared/           Reveal directives, command palette, terminal modal, CV modal, github stats
│       ├── three/            Lazy-loaded three.js solar-system hero (engine + shaders)
│       ├── pages/
│       │   ├── home/         Public site (hero, skills, timeline, projects, contact, …)
│       │   └── blog/         Blog list & dynamic markdown post view
│       └── admin/            Login, layout, dashboard (analytics charts), generic CRUD, profile, messages
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

Cả Render và Netlify đều deploy từ GitHub. Repo này đã có remote `origin`
(`github.com/thien1708/portfolio`) với code mới nhất trên nhánh `main` — nếu bạn
clone/fork sang repo khác thì:

1. Tạo repo mới trên <https://github.com/new> (chọn **Private** nếu không muốn lộ
   số điện thoại trong file CV PDF — hoặc xoá file CV khỏi repo:
   `git rm --cached "CV Eng_TranVuThien.pdf" && git commit -m "remove CV"`).
2. Push:

   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```

> **Về quy trình git & deploy**: Repo sử dụng mô hình 2 nhánh: phát triển trên `develop`
> và merge vào `main` khi ổn định. Render và Netlify mặc định build từ nhánh `main`.

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
   | `MAIL_PROVIDER` | `smtp` (mặc định) hoặc `resend` — xem hướng dẫn Resend bên dưới |
   | `MAIL_USERNAME` | Kênh **SMTP**: Gmail gửi thông báo. Kênh **Resend**: địa chỉ From (để trống nếu dùng `onboarding@resend.dev`) |
   | `MAIL_PASSWORD` | **App Password** 16 ký tự của Gmail (chỉ kênh SMTP), *không phải* mật khẩu Gmail thường — để trống nếu dùng Resend |
   | `RESEND_API_KEY` | API key `re_xxx` từ resend.com (chỉ dùng khi `MAIL_PROVIDER=resend`) |

3. **Apply / Deploy** và mở tab **Logs**. Lần build đầu mất ~5–10 phút (Docker
   build Maven). Deploy thành công khi log có:

   ```
   Successfully applied 2 migrations ...   ← Flyway đã tạo schema + seed dữ liệu CV lên Supabase
   Admin user 'tranvuthien1708@gmail.com' created.
   Started PortfolioBackendApplication
   ```

   (Số migration tăng dần theo thời gian — quan trọng là dòng `Successfully applied`
   không kèm lỗi.)

4. Ghi lại **URL của service** hiển thị đầu trang, dạng
   `https://portfolio-backend-xxxx.onrender.com`. Kiểm tra nhanh:
   mở `https://portfolio-backend-xxxx.onrender.com/api/v1/health` → `{"status":"UP"}`
   và `/api/v1/profile` → JSON dữ liệu CV.

### Bước 2b — Email thông báo liên hệ (bắt buộc hiểu trước khi deploy)

Hệ thống có 2 kênh gửi email thông báo khi khách gửi form contact tới bạn.
**Trên free tier, Render chặn outbound SMTP** → khuyến nghị dùng **Resend**
(HTTPS API, chạy qua port 443 - không bị chặn).

#### 🅰 Kênh 1 — Resend API (khuyến nghị cho Render free)

1. Tạo tài khoản miễn phí tại <https://resend.com>.
2. **Verify domain** (khuyến nghị) hoặc dùng địa chỉ mặc định
   `onboarding@resend.dev` để test (chỉ gửi được tới email bạn đăng ký lúc tạo tài
   khoản). Để gửi tới email bất kỳ, phải **verify domain** tại
   *Domains → Add Domain* và thêm DNS record (CNAME/MX) vào nhà cung cấp domain.
3. Lấy API key: **API Keys → Create API Key** → copy chuỗi bắt đầu bằng `re_`.
4. Trên Render (Dashboard → service → Environment), đặt:
   - `MAIL_PROVIDER = resend`
   - `RESEND_API_KEY = re_...`
   - `MAIL_PASSWORD` **để trống** (không dùng SMTP).
   - Với `MAIL_USERNAME`: để trống khi test với `onboarding@resend.dev`. Nếu bạn đã
     **verify domain** ở Resend, đặt `MAIL_USERNAME` = địa chỉ muốn gửi thư, vd
     `MAIL_USERNAME = Portfolio <contact@your-domain.com>`. (Biến này đồng thời là
     `From` address; backend tự fallback `Portfolio <onboarding@resend.dev>` khi trống.)
5. Save → Render restart. Mở **Logs**, ban đầu sẽ thấy:
   `Contact notifications will use the Resend HTTPS API (provider=resend)`.
6. Gửi thử 1 form contact trên site → sau vài giây bạn nhận email thông báo tại
   `CONTACT_NOTIFY_TO` (mặc định = `ADMIN_EMAIL`).

> ⚠️ **Khi dùng Resend**: `MAIL_USERNAME` đóng vai trò **From address** (nếu bạn đã
> verify domain, đặt nó là địa chỉ verify của bạn; nếu chưa verify, để trống để dùng
> `onboarding@resend.dev`). `MAIL_PASSWORD` phải **để trống** khi dùng Resend — nó chỉ
> phục vụ kênh Gmail SMTP.

#### 🅱 Kênh 2 — Gmail SMTP (mặc định khi không đặt `MAIL_PROVIDER`)

Dùng khi chạy local, Docker, hoặc sau khi nâng Render lên plan không chặn SMTP:

- `MAIL_PROVIDER = smtp` (mặc định khi không đặt)
- `MAIL_USERNAME` = Gmail gửi thông báo (vd `yourmail@gmail.com`)
- `MAIL_PASSWORD` = **App Password** 16 ký tự, tạo tại
  Google Account → Security → 2-Step Verification → **App passwords**
  (*không phải* mật khẩu Gmail thường).
- Email đi ra từ Gmail của bạn tới `CONTACT_NOTIFY_TO`.

> 💡 **Chuyển đổi**: Chỉ cần đổi `MAIL_PROVIDER` và bộ biến tương ứng. Code giữ
> nguyên cả 2 sender (SMTP + Resend), `MailSenderConfig` tự chọn channel đang
> cấu hình khi service start — không cần deploy lại code, chỉ restart sau khi
> đổi biến môi trường.

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
- [ ] Mở trang Blog (`/blog`), click đọc bài viết (`/blog/:slug`)
- [ ] Phím tắt: `Ctrl + ~` mở Interactive Terminal modal, click nút CV để xem/tải CV (`/cv-vi.pdf`, `/cv-en.pdf`)
- [ ] Gửi thử form **Contact** → báo thành công và nhận email thông báo
- [ ] Vào `/admin`, đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` đã đặt trên Render
- [ ] Thấy tin nhắn contact vừa gửi trong mục **Messages**
- [ ] Dashboard admin: xem biểu đồ thống kê truy cập (Analytics)
- [ ] Quản lý CRUD: sửa một skill / thêm bài viết Blog / upload avatar → refresh trang public thấy thay đổi ngay
- [ ] Ảnh upload có URL dạng `https://<project-ref>.supabase.co/storage/v1/object/public/portfolio/...`

### Bước 6 — Hoàn thiện SEO khi đã có URL chính thức

`frontend/src/index.html` đã có sẵn meta description, Open Graph (kèm `og:image`),
Twitter card (`summary_large_image` + `twitter:image`) và JSON-LD; ảnh preview
1200×630 nằm tại `frontend/public/og-image.png`; `frontend/public/robots.txt` đã
chặn `/admin` và khai báo `sitemap.xml`; `frontend/public/sitemap.xml` đã bao gồm các trang chính và bài viết.
Còn vài thứ **phải chờ có URL thật** mới điền được — sau khi chốt
tên miền (vd `https://tranvuthien.netlify.app` hoặc domain riêng), sửa
`frontend/src/index.html` (vị trí đã đánh dấu bằng comment trong `<head>`):

```html
<!-- cập nhật link canonical và og:url -->
<link rel="canonical" href="https://<URL-cua-ban>/">
<meta property="og:url" content="https://<URL-cua-ban>/">
<!-- và đổi og:image / twitter:image từ đường dẫn tương đối sang tuyệt đối -->
<meta property="og:image" content="https://<URL-cua-ban>/og-image.png">
<meta name="twitter:image" content="https://<URL-cua-ban>/og-image.png">
```

Sau khi có URL chính thức, cập nhật URL trong `frontend/public/sitemap.xml` và `frontend/public/robots.txt`,
rồi submit sitemap trên [Google Search Console](https://search.google.com/search-console).

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
| Log: `Contact notification skipped: no mail channel is configured` | Không có kênh mail nào được cấu hình. Set `MAIL_PROVIDER=resend` + `RESEND_API_KEY`, hoặc `MAIL_PROVIDER=smtp` + `MAIL_USERNAME`/`MAIL_PASSWORD`. |
| Log: `Contact notifications will use SMTP` trên Render free | Dùng kênh SMTP nhưng free tier chặn SMTP. Đổi sang `MAIL_PROVIDER=resend` + `RESEND_API_KEY`. |
| Resend báo lỗi 403 `Missing required field: "from"` | `MAIL_USERNAME`/From trống và tài khoản chưa verify domain. Verify domain trên Resend rồi set `MAIL_USERNAME` = địa chỉ verify, hoặc test tạm với email đăng ký. |
| Resend báo `Domain not verified` | Chưa hoàn tất verify domain (thêm DNS record CNAME/MX tại nhà cung cấp) và chờ Resend xác nhận. |
| Gửi contact thành công nhưng không nhận email | Kiểm tra log Render: nếu `Contact notification skipped` → chưa cấu hình channel; nếu `failed (attempt 1/3)` → sai App Password / API key / From chưa verify. |

## Kiểm thử & Chuẩn mã nguồn (Tests & Lint)

```bash
cd backend && ./mvnw test        # Kiểm thử backend: xác thực (khóa tài khoản, xoay vòng token, chống tấn công), dịch vụ CRUD, lưu trữ, email, blog, analytics
cd frontend && npx ng test       # Kiểm thử frontend: unit test các component (cần Chrome)
cd frontend && npx ng lint       # Kiểm tra chuẩn mã nguồn ESLint (angular-eslint, bao gồm cả quy tắc trợ năng accessibility)
```
