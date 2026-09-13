# Portfolio — Deploy: Oracle Cloud (OCI) + Netlify + Supabase

Hướng dẫn chi tiết deploy portfolio lên **Oracle Cloud Infrastructure (OCI) Always Free** cho backend,
**Netlify** cho frontend, và **Supabase** cho database + storage. Miễn phí vĩnh viễn.

---

## Kiến trúc khi deploy

```
Trình duyệt ──► Netlify (Angular static site)
                  │  proxy /api/* (netlify.toml)
                  ▼
                Oracle Cloud (Ubuntu ARM, Docker) ──► Supabase (PostgreSQL + Storage)
                     │
                     └── Caddy (reverse proxy + auto HTTPS, port 80/443)
```

**Ưu điểm so với Render:**
- Miễn phí **vĩnh viễn** (Always Free — không hết hạn sau 90 ngày)
- **Region Singapore** — cùng khu vực với Supabase Mumbai (AP South Asia) → latency thấp
- Tốc độ nhanh hơn đáng kể do cùng region

**Nhược điểm:**
- Cần tự cài đặt (SSH, Docker, Caddy)
- Không có managed HTTPS tự động như Render — Caddy thay thế
- Dashboard Oracle phức tạp hơn

---

## Bước 0 — Đẩy code lên GitHub

Cả Netlify và CI/CD script đều cần GitHub. Repo này đã có remote `origin`:

```bash
# Clone nếu chưa có
git clone https://github.com/thien1708/portfolio.git
cd portfolio

# Kiểm tra nhánh
git branch -a
# Nên làm việc trên nhánh `deploy` cho production
git checkout deploy
```

---

## Bước 1 — Tạo project Supabase (database + storage)

### 1.1 Tạo project Supabase

1. Vào <https://supabase.com> → **New project** → đặt tên, chọn region
   (**Singapore `ap-southeast-1`** cho latency thấp nhất với Oracle Singapore),
   đặt **Database Password** (lưu lại!).
2. Chờ project khởi tạo (~2 phút).

### 1.2 Lấy database connection string

*Project Settings → Database → Connection string*, chọn tab **Session pooler**
(⚠️ đừng dùng *Direct connection* — chỉ hỗ trợ IPv6, Oracle sẽ không kết nối được):

```
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Tách thành 3 giá trị:

| Biến | Giá trị |
| --- | --- |
| `DATABASE_URL` | `jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` (thêm prefix `jdbc:`, bỏ user/password) |
| `DATABASE_USERNAME` | `postgres.abcdefghijk` |
| `DATABASE_PASSWORD` | mật khẩu DB bạn đặt ở bước 1.1 |

### 1.3 Tạo bucket ảnh

Menu **Storage** → *New bucket* → tên `portfolio` → bật **Public bucket** → Create.

### 1.4 Lấy Supabase API keys

*Project Settings → API*:

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

---

## Bước 2 — Tạo tài khoản Oracle Cloud Free Tier

### 2.1 Đăng ký

1. Vào <https://www.oracle.com/cloud/free/> → **Start for free**
2. Đăng ký với email thật (cần verify số điện thoại + thẻ Visa/Mastercard — không trừ tiền)
3. Chọn **Always Free** — không đăng ký trial (trial hết hạn sau 30 ngày)

### 2.2 Chọn Region

Sau khi đăng nhập vào [cloud.oracle.com](https://cloud.oracle.com):

1. Click **hamburger menu** (☰) góc trên trái → **Compute** → **Instances**
2. Click **Change Region** → chọn **Singapore (ap-singapore-1)**
   (Region gần Supabase nhất, đảm bảo latency thấp)

### 2.3 Tạo Instance (Always Free ARM)

1. **Create instance**:
   - **Name**: `portfolio-backend`
   - **Placement**: Availability Domain → chọn domain có sẵn (tự động)
   - **Image**: Oracle Linux 8 (hoặc Ubuntu 22.04 — hướng dẫn này dùng **Ubuntu**)
   - **Shape**: click **Change shape** → chọn **Ampere** → **VM.Standard.A1.Flex**
     (4 cores, 24 GB RAM — Always Free limit)
   - **Networking**: Create new VCN hoặc dùng default
   - **Add SSH Keys**: chọn **Generate SSH Key** (Oracle tự sinh) → **Save Private Key**
     (file `oci_private_key.pem` sẽ tải về)

2. **Save** → đợi instance khởi tạo (~2-3 phút)

### 2.4 Ghi lại thông tin Instance

Sau khi tạo xong, ghi lại:
- **Public IP Address** (dạng `129.x.x.x`) — dùng để SSH và trỏ domain
- **Username** (default: `ubuntu` với Ubuntu image)
- **Private key** (`oci_private_key.pem`) đã tải ở bước 2.3

---

## Bước 3 — SSH vào Oracle Instance

### 3.1 Cài SSH Client (Windows PowerShell / Git Bash)

**Windows PowerShell:**
```powershell
# Di chuyển key vào thư mục user, đặt quyền đúng
mkdir $HOME\.ssh
mv ~/Downloads/oci_private_key.pem $HOME\.ssh\
icacls $HOME\.ssh\oci_private_key.pem /inheritance:r /grant:r "$env:USERNAME:R"
```

**Git Bash / Linux / Mac:**
```bash
mkdir -p ~/.ssh
mv ~/Downloads/oci_private_key.pem ~/.ssh/
chmod 600 ~/.ssh/oci_private_key.pem
```

### 3.2 SSH vào Instance

```bash
ssh -i ~/.ssh/oci_private_key.pem ubuntu@<PUBLIC_IP>
```

Lần đầu connect sẽ hỏi xác nhận fingerprint — gõ `yes`.

> **PowerShell lỗi `Bad permissions`?** Dùng Git Bash hoặc WSL thay thế.
> Nếu dùng PowerShell 5.1, chạy:
> ```powershell
> $keyPath = "$HOME\.ssh\oci_private_key.pem"
> icacls $keyPath /remove:d "$env:USERNAME" /grant:r "$env:USERNAME:R" /inheritance:r
> icacls $keyPath /grant:r "$env:USERNAME:R"
> ```

---

## Bước 4 — Cài đặt môi trường trên Ubuntu

Chạy từng lệnh trong SSH session:

### 4.1 Update hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

### 4.2 Cài Java 21 (Spring Boot yêu cầu)
```bash
sudo apt install -y openjdk-21-jdk
java -version   # xác nhận java 21
```

### 4.3 Cài Docker
```bash
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker
```

### 4.4 Cài Caddy (reverse proxy + auto HTTPS)

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
sudo apt update
sudo apt install -y caddy
```

### 4.5 Thoát SSH và re-login (để áp dụng group docker)

```bash
exit
ssh -i ~/.ssh/oci_private_key.pem ubuntu@<PUBLIC_IP>
# Kiểm tra docker hoạt động
docker ps
```

---

## Bước 5 — Build và chạy Backend

### 5.1 Tạo thư mục deploy
```bash
mkdir -p ~/portfolio/backend
```

### 5.2 Upload code lên Oracle (từ máy local, không phải SSH)

**Cách 1 — Git clone trực tiếp trên Oracle:**
```bash
# Trên Oracle instance (SSH)
cd ~/portfolio
git clone https://github.com/thien1708/portfolio.git backend
cd backend
git checkout deploy   # hoặc main
```

**Cách 2 — Upload JAR đã build sẵn (nhanh hơn, khuyến nghị):**

Build trên máy local rồi upload:
```bash
# Máy local (PowerShell/bash)
cd backend
./mvnw -DskipTests clean package -q
scp -i ~/.ssh/oci_private_key.pem \
  target/portfolio-backend-0.0.1-SNAPSHOT.jar \
  ubuntu@<PUBLIC_IP>:~/portfolio/backend/
```

### 5.3 Tạo file environment variables

Trên Oracle instance (SSH):
```bash
nano ~/portfolio/backend/.env
```

Paste nội dung sau (điền giá trị thật từ Bước 1):

```env
DATABASE_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
DATABASE_USERNAME=postgres.<project-ref>
DATABASE_PASSWORD=<your-db-password>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
JWT_SECRET=<generate 32+ random chars, e.g.: openssl rand -base64 32>
ADMIN_PASSWORD=<your-admin-password>
ADMIN_EMAIL=tranvuthien1708@gmail.com
CORS_ALLOWED_ORIGINS=https://<your-netlify-url>.netlify.app
COOKIE_SECURE=true
STORAGE_PROVIDER=supabase
STORAGE_UPLOAD_DIR=uploads
```

Lưu file: `Ctrl+O` → `Enter` → `Ctrl+X`

### 5.4 Chạy backend lần đầu (test)

```bash
cd ~/portfolio/backend
source .env
java -jar target/portfolio-backend-0.0.1-SNAPSHOT.jar
```

Kiểm tra:
- Mở trình duyệt: `http://<PUBLIC_IP>:8080/api/v1/health` → `{"status":"UP"}`
- Log phải có: `Successfully applied 4 migrations` và `Admin user created`

**Tắt test:** `Ctrl+C`

---

## Bước 6 — Caddy reverse proxy với auto HTTPS

### 6.1 Cấu hình Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```

Xóa hết nội dung cũ, paste (thay `<PUBLIC_IP>` bằng IP thật hoặc domain):

```caddy
# HTTP → HTTPS redirect
http:// {
    redir https://{host}{uri}
}

# HTTPS endpoint
https://<PUBLIC_IP> {
    reverse_proxy localhost:8080
}
```

Lưu: `Ctrl+O` → `Enter` → `Ctrl+X`

### 6.2 Khởi động Caddy

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl status caddy   # kiểm tra Active: active (running)
```

### 6.3 Kiểm tra HTTPS

Mở trình duyệt: `https://<PUBLIC_IP>/api/v1/health`
(Truy cập lần đầu sẽ hiện cảnh báo certificate — do dùng IP chưa có SSL hợp lệ. Tạm thời bấm "Advanced → Proceed".)

---

## Bước 7 — Deploy Backend với Systemd (tự khởi động)

Tạo systemd service để backend tự chạy khi reboot:

```bash
sudo nano /etc/systemd/system/portfolio-backend.service
```

Paste nội dung:

```ini
[Unit]
Description=Portfolio Backend (Spring Boot)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/portfolio/backend
EnvironmentFile=/home/ubuntu/portfolio/backend/.env
ExecStart=/usr/bin/java -jar /home/ubuntu/portfolio/backend/target/portfolio-backend-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Lưu và enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable portfolio-backend
sudo systemctl start portfolio-backend
sudo systemctl status portfolio-backend
```

**Kiểm tra hoạt động:**
```bash
curl https://<PUBLIC_IP>/api/v1/health   # phải trả {"status":"UP"}
```

---

## Bước 8 — Mở Firewall trên Oracle

Nếu truy cập bị chặn, cần mở port 80 và 443:

1. Vào [cloud.oracle.com](https://cloud.oracle.com) → **Compute** → **Instances**
2. Click vào instance `portfolio-backend`
3. Tab **Primary VNIC** → **Subnet** → click vào subnet name
4. **Security Lists** → click vào security list
5. **Add Ingress Rules**:
   - Source CIDR: `0.0.0.0/0`, IP Protocol: `TCP`, Destination Port Range: `80,443`
   - Source CIDR: `0.0.0.0/0`, IP Protocol: `TCP`, Destination Port Range: `8080`
6. **Add Egress Rules** (cho phép outbound):
   - Destination: `0.0.0.0/0`, IP Protocol: `All`

Đợi ~1 phút để rule có hiệu lực.

---

## Bước 9 — Deploy Frontend lên Netlify

### 9.1 Cập nhật netlify.toml

Trên máy local, mở **`netlify.toml`**, thay URL Oracle:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://<PUBLIC_IP>/api/:splat"
  status = 200
  force = true
  headers = {X-Forwarded-Proto = "https"}

[[redirects]]
  from = "/uploads/*"
  to = "https://<PUBLIC_IP>/uploads/:splat"
  status = 200
  force = true
```

> ⚠️ **Lưu ý:** Nếu dùng IP (không có domain), Netlify sẽ không proxy qua HTTPS được.
> **Khuyến nghị:** Mua domain rẻ (~50k VNĐ/năm) và trỏ về Oracle IP, hoặc dùng
> **DuckDNS / no-ip** (miễn phí) để có subdomain thật → Caddy tự động lấy SSL.
>
> **Phương án thay thế (đơn giản nhất):**
> Không dùng proxy — sửa frontend API base URL trực tiếp:
> ```typescript
> // frontend/src/environments/environment.ts
> export const environment = {
>   apiUrl: 'https://<PUBLIC_IP>/api/v1',
>   // ...
> };
> ```
> Sau đó Netlify deploy bình thường, không cần proxy.

### 9.2 Deploy lên Netlify

1. Vào <https://app.netlify.com> → **Add new site → Import an existing project**
2. Connect repo GitHub
3. Netlify tự đọc `netlify.toml` (base `frontend`, Node 22, build `npm run build`)
4. **Deploy site**
5. Đổi tên: *Site configuration → Site details → Change site name*

### 9.3 Cập nhật CORS trên Oracle

Quay lại SSH, sửa `CORS_ALLOWED_ORIGINS` trong `.env`:

```bash
nano ~/portfolio/backend/.env
# Đổi CORS_ALLOWED_ORIGINS=https://<netlify-url>.netlify.app
sudo systemctl restart portfolio-backend
```

---

## Bước 10 — Kết nối Domain (tùy chọn, khuyến nghị)

Dùng domain miễn phí để có SSL hợp lệ (Caddy tự động lấy Let's Encrypt):

### 10.1 Đăng ký domain miễn phí

- **DuckDNS**: <https://www.duckdns.org> — đăng ký free, chọn subdomain
  (vd `tranvuthien.duckdns.org`)
- **Freenom** (đang hạn chế): <https://www.freenom.com> — .tk, .ml, .ga domain miễn phí

### 10.2 Trỏ DNS về Oracle IP

Trong DuckDNS/Freenom dashboard, thêm record:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `<PUBLIC_IP>` |
| A | `www` | `<PUBLIC_IP>` |

### 10.3 Cập nhật Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

```caddy
https://tranvuthien.duckdns.org {
    reverse_proxy localhost:8080
}
```

```bash
sudo systemctl restart caddy
```

Giờ truy cập `https://tranvuthien.duckdns.org` → SSL hợp lệ, proxy về backend.

---

## Bước 11 — Cập nhật frontend API URL (nếu dùng domain)

Nếu có domain, sửa frontend để gọi API trực tiếp (bỏ proxy):

```bash
# Máy local
nano frontend/src/environments/environment.ts
```

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tranvuthien.duckdns.org/api/v1',
};
```

```bash
git add frontend/src/environments/environment.ts
git commit -m "point API to OCI domain"
git push
```

Netlify sẽ auto deploy.

---

## Kiểm tra sau deploy

- [ ] `https://<domain>/api/v1/health` → `{"status":"UP"}`
- [ ] `https://<domain>/api/v1/portfolio` → JSON toàn bộ dữ liệu
- [ ] Mở site Netlify: hero hiện tên + hiệu ứng, skills/projects load từ Supabase
- [ ] Form **Contact** → gửi thành công
- [ ] Vào `/admin`, đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] Upload avatar → hiển thị ảnh từ Supabase Storage

---

## Cập nhật code (CI/CD thủ công)

Mỗi lần push code mới:

```bash
# Trên Oracle instance (SSH)
cd ~/portfolio/backend
git pull origin deploy
./mvnw -DskipTests clean package -q
sudo systemctl restart portfolio-backend
```

Hoặc build trên local rồi upload:
```bash
# Máy local
cd backend
./mvnw -DskipTests clean package -q
scp -i ~/.ssh/oci_private_key.pem \
  target/portfolio-backend-0.0.1-SNAPSHOT.jar \
  ubuntu@<PUBLIC_IP>:~/portfolio/backend/
# Trên Oracle
sudo systemctl restart portfolio-backend
```

**Tự động hóa với GitHub Actions** (nâng cao): thêm workflow deploy webhook
hoặc dùng `deploy-to-oci.sh` script — hỏi nếu cần hướng dẫn.

---

## Sự cố thường gặp

| Triệu chứng | Nguyên nhân & cách xử lý |
| --- | --- |
| SSH `Connection refused` | Oracle firewall chưa mở port 22. Vào OCI Console → Security List → add ingress port 22. |
| `curl` timeout | Firewall OCI chưa mở port 80/443. Kiểm tra Bước 8. |
| Oracle instance bị chặn tạo | Đã dùng hết Always Free quota. Xóa instance cũ hoặc nâng paid. |
| Caddy SSL lỗi | Caddy cần port 80 để verify Let's Encrypt. Đảm bảo port 80 mở và không có service khác dùng. |
| Database connection fail | Đổi sang **Session pooler** port 5432 (không phải Direct connection port 5432 hoặc Transaction port 6543). |
| Backend không start sau reboot | Kiểm tra `sudo systemctl status portfolio-backend` và xem log `journalctl -u portfolio-backend -n 50`. |
| Build Maven chậm trên ARM | ARM Ampere compile chậm hơn x86 ~30%. Dùng `scp` upload JAR đã build sẵn thay vì build trên Oracle. |
| Oracle không thể SSH với key | Key file sai quyền. Linux/Mac: `chmod 600 ~/.ssh/oci_private_key.pem`. Windows: dùng Git Bash thay PowerShell. |

---

## So sánh: Oracle OCI vs Render Free

| | Oracle OCI Always Free | Render Free (đã bị loại bỏ) |
| --- | --- | --- |
| **Chi phí** | Miễn phí vĩnh viễn | Không còn free tier |
| **RAM** | 4 GB (hoặc 24 GB nếu dùng 4 ARM cores) | 512 MB |
| **CPU** | 2-4 ARM cores | 0.5 shared vCPU |
| **Storage** | 200 GB | 1 GB |
| **HTTPS** | Caddy tự động (Let's Encrypt) | Tự động |
| **Region** | ✅ Singapore | ❌ US only |
| **Cold start** | Luôn online (Always Free) | ~5-20s sau 15 phút không active |
| **Setup** | Thủ công (SSH, Docker, Caddy) | Tự động (Git push → deploy) |
| **Latency → Supabase** | ~10-30ms (cùng region) | ~200-400ms (US → India) |

---

## Cleanup — Dọn dẹp tài nguyên Oracle

Nếu không cần nữa:

1. **Terminate instance**: OCI Console → Compute → Instances → **Terminate**
   (⚠️ chọn **Permanently delete** the boot volume nếu muốn xóa hoàn toàn)
2. **Xóa VCN** nếu tạo riêng
3. **Xóa Object Storage** nếu có
4. Supabase và Netlify: xóa project trong dashboard tương ứng
