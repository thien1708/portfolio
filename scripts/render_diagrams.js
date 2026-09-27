const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '../docs/images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const diagrams = [
  {
    name: 'diagram_architecture_overview.png',
    width: 950,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 25px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-sizing: border-box; width: 900px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #1e3a8a; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Sơ đồ 2.1: Kiến trúc phân tầng tổng thể hệ thống</h3>
        <p style="margin: 6px 0 0 0; color: #64748b; font-size: 14px;">Mô hình phân tầng kiến trúc từ Client, CDN/Gateway đến Backend Spring Boot & Đám mây</p>
      </div>

      <!-- Tầng 1: Client -->
      <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #166534; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 6px; font-size: 12px;">TẦNG 1</span>
          CLIENT TIER — ỨNG DỤNG WEB ĐƠN TRANG (ANGULAR 20 SPA)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: white; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #15803d; font-size: 15px;">Phân hệ Public Web (Khách & Tuyển dụng)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 4px; line-height: 1.6;">• Hero 3D tương tác (Three.js), About & Timeline<br>• Technical Blog & Trình xem Markdown<br>• Form liên hệ trực tuyến (Rate-limit 3 req/phút)<br>• Terminal giả lập (Ctrl + ~) & Modal xem/tải CV</div>
          </div>
          <div style="background: white; border: 1.5px solid #bbf7d0; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #15803d; font-size: 15px;">Phân hệ Admin CMS (Quản trị viên)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 4px; line-height: 1.6;">• Xác thực bảo mật JWT (15p) + Refresh Token (7d)<br>• Dashboard thống kê Analytics & Thiết bị<br>• Quản lý CRUD 6 thực thể & Kéo thả sắp xếp<br>• Hộp thư phản hồi & Upload ảnh lên Storage</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; color: #0284c7; font-weight: 700; font-size: 16px; margin: 8px 0;">⬇ REST API Calls (HTTPS / JSON / Bearer JWT) ⬇</div>

      <!-- Tầng 2: Gateway & Security -->
      <div style="background: #eff6ff; border: 2px solid #93c5fd; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #1e40af; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 6px; font-size: 12px;">TẦNG 2</span>
          AN NINH & ĐIỀU PHỐI (SECURITY & GATEWAY TIER)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div style="background: white; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: 700; color: #1d4ed8; font-size: 14px;">Bảo mật mạng & Tiêu đề</div>
            <div style="color: #475569; font-size: 12px; margin-top: 4px;">CORS Allowed Origins, CSP, HSTS, X-Content-Type-Options</div>
          </div>
          <div style="background: white; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: 700; color: #1d4ed8; font-size: 14px;">Kiểm soát lưu lượng</div>
            <div style="color: #475569; font-size: 12px; margin-top: 4px;">Bucket4j Rate Limiting per IP, chống DDoS tầng ứng dụng</div>
          </div>
          <div style="background: white; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-weight: 700; color: #1d4ed8; font-size: 14px;">Phiên & Khóa tài khoản</div>
            <div style="color: #475569; font-size: 12px; margin-top: 4px;">Khóa tài khoản 15 phút sau 5 lần sai, Refresh Token Rotation</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; color: #0284c7; font-weight: 700; font-size: 16px; margin: 8px 0;">⬇ Controllers & Services ⬇</div>

      <!-- Tầng 3: Backend Core -->
      <div style="background: #faf5ff; border: 2px solid #d8b4fe; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <div style="font-weight: 700; color: #6b21a8; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span style="background: #a855f7; color: white; padding: 2px 8px; border-radius: 6px; font-size: 12px;">TẦNG 3</span>
          APPLICATION CORE TIER — SPRING BOOT 3.5 SERVICES
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
          <div style="background: white; border: 1px solid #e9d5ff; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #7e22ce; font-size: 13px;">Portfolio API</div>
            <div style="color: #475569; font-size: 12px; margin-top: 2px;">Endpoint /portfolio, cache in-memory 10 phút</div>
          </div>
          <div style="background: white; border: 1px solid #e9d5ff; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #7e22ce; font-size: 13px;">Blog & Analytics</div>
            <div style="color: #475569; font-size: 12px; margin-top: 2px;">CRUD bài viết, tính lượt xem, ghi nhận sự kiện</div>
          </div>
          <div style="background: white; border: 1px solid #e9d5ff; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #7e22ce; font-size: 13px;">Dual Mail Sender</div>
            <div style="color: #475569; font-size: 12px; margin-top: 2px;">Resend HTTPS API cổng 443 fallback Gmail SMTP</div>
          </div>
          <div style="background: white; border: 1px solid #e9d5ff; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #7e22ce; font-size: 13px;">Admin CRUD API</div>
            <div style="color: #475569; font-size: 12px; margin-top: 2px;">Quản lý toàn bộ tài nguyên, batch reorder</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; color: #0284c7; font-weight: 700; font-size: 16px; margin: 8px 0;">⬇ HikariCP Connection Pool / Cloud REST API ⬇</div>

      <!-- Tầng 4: Database & Storage -->
      <div style="background: #fffbeb; border: 2px solid #fde68a; border-radius: 10px; padding: 16px;">
        <div style="font-weight: 700; color: #92400e; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
          <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 6px; font-size: 12px;">TẦNG 4</span>
          DATA & INFRASTRUCTURE TIER — POSTGRESQL & SUPABASE CLOUD
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: white; border: 1.5px solid #fef08a; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #b45309; font-size: 15px;">Supabase PostgreSQL (11 Bảng CSDL)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 4px; line-height: 1.6;">• Flyway Migration kiểm soát phiên bản schema tự động<br>• Khóa ngoại ON DELETE CASCADE, ràng buộc toàn vẹn dữ liệu<br>• Mã hóa mật khẩu BCrypt, mã hóa SHA-256 Refresh Tokens</div>
          </div>
          <div style="background: white; border: 1.5px solid #fef08a; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #b45309; font-size: 15px;">Supabase Storage (Cloud Buckets)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 4px; line-height: 1.6;">• Lưu trữ hình ảnh Avatar, Dự án, Ảnh bìa Blog<br>• Upload trực tiếp qua REST API (giới hạn dung lượng ≤ 2MB)<br>• Cung cấp URL CDN công khai tốc độ cao</div>
          </div>
        </div>
      </div>
    </div>
    `
  },
  {
    name: 'diagram_public_web.png',
    width: 900,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-sizing: border-box; width: 850px;">
      <div style="text-align: center; margin-bottom: 18px;">
        <h3 style="margin: 0; color: #047857; font-size: 20px; font-weight: 700; text-transform: uppercase;">Sơ đồ 2.2: Luồng chức năng Phân hệ Public Web</h3>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Trải nghiệm người dùng tương tác, tải dữ liệu công khai và gửi thông điệp</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="background: #10b981; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Trang chủ tương tác (Hero 3D, About & Skills)</div>
            <div style="color: #475569; font-size: 13px; margin-top: 2px;">Tải dữ liệu từ GET /api/v1/portfolio (Cache 10m). Hiển thị hiệu ứng 3D Three.js, thanh kỹ năng % sống động và thanh đếm GitHub.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="background: #10b981; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Lưới dự án & Lọc công nghệ (Projects & Filter)</div>
            <div style="color: #475569; font-size: 13px; margin-top: 2px;">Duyệt dự án nổi bật (Featured), lọc tức thời theo tag công nghệ (Java, Angular, Docker...), liên kết trực tiếp Demo và GitHub Repo.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="background: #10b981; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Technical Blog & Trình đọc Markdown chuyên sâu</div>
            <div style="color: #475569; font-size: 13px; margin-top: 2px;">Danh sách bài viết qua GET /api/v1/posts, xem chi tiết theo slug, highlight cú pháp mã nguồn, tự động tăng bộ đếm lượt xem.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="background: #10b981; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">4</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Kênh liên hệ trực tuyến Rate-limited (Contact Channel)</div>
            <div style="color: #475569; font-size: 13px; margin-top: 2px;">Gửi thông điệp qua POST /api/v1/contact, giới hạn 3 lần/phút/IP, ghi CSDL và kích hoạt Dual Mail Sender thông báo ngầm cho Admin.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="background: #10b981; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">5</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #0f172a; font-size: 15px;">Terminal CLI giả lập & Bộ xem CV đa ngôn ngữ</div>
            <div style="color: #475569; font-size: 13px; margin-top: 2px;">Mở Terminal tương tác bằng phím tắt Ctrl + ~, hỗ trợ xem/tải CV trực tiếp định dạng PDF tiếng Việt / tiếng Anh.</div>
          </div>
        </div>
      </div>
    </div>
    `
  },
  {
    name: 'diagram_admin_cms.png',
    width: 900,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-sizing: border-box; width: 850px;">
      <div style="text-align: center; margin-bottom: 18px;">
        <h3 style="margin: 0; color: #1d4ed8; font-size: 20px; font-weight: 700; text-transform: uppercase;">Sơ đồ 2.3: Luồng bảo mật & Chức năng Phân hệ Admin CMS</h3>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Quy trình xác thực an toàn, điều hành bảng tin và quản trị vòng đời tài nguyên</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px;">
          <div style="background: #2563eb; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 15px;">Đăng nhập bảo mật & Refresh Token Rotation (RTR)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 2px;">POST credentials, nhận JWT Access Token (15m) trong body và Refresh Token (7d) trong HttpOnly Secure Cookie. Tự động thu hồi token cũ khi cấp mới.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px;">
          <div style="background: #2563eb; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 15px;">Khóa tài khoản tự động (Account Lockout Policy)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 2px;">Theo dõi số lần đăng nhập sai; khi đạt ngưỡng 5 lần liên tiếp, hệ thống khóa tài khoản 15 phút và từ chối xử lý, ngăn chặn tấn công brute-force.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px;">
          <div style="background: #2563eb; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 15px;">Dashboard giám sát & Thống kê truy cập (Analytics)</div>
            <div style="color: #334155; font-size: 13px; margin-top: 2px;">Trực quan hóa tổng lượt xem trang, người dùng duy nhất, tỷ lệ thiết bị (Desktop/Mobile), các trang được xem nhiều nhất và trạng thái hộp thư liên hệ.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px;">
          <div style="background: #2563eb; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">4</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 15px;">Quản lý toàn diện tài nguyên CRUD & Kéo thả sắp xếp</div>
            <div style="color: #334155; font-size: 13px; margin-top: 2px;">Thêm/Sửa/Xóa dữ liệu Profile, Kỹ năng, Kinh nghiệm, Dự án, Học vấn, Chứng chỉ, Bài viết. Hỗ trợ kéo thả thay đổi vị trí tức thì.</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 14px;">
          <div style="background: #2563eb; color: white; font-weight: 800; font-size: 18px; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">5</div>
          <div style="flex-grow: 1;">
            <div style="font-weight: 700; color: #1e3a8a; font-size: 15px;">Hộp thư phản hồi & Upload ảnh Supabase Storage</div>
            <div style="color: #334155; font-size: 13px; margin-top: 2px;">Duyệt tin nhắn liên hệ từ người xem, đánh dấu đã đọc. Tải trực tiếp ảnh dự án, avatar lên đám mây với xác thực định dạng file và dung lượng ≤2MB.</div>
          </div>
        </div>
      </div>
    </div>
    `
  },
  {
    name: 'diagram_erd_auth.png',
    width: 900,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-sizing: border-box; width: 850px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #991b1b; font-size: 20px; font-weight: 700; text-transform: uppercase;">Sơ đồ 5.1: ERD Phân hệ Xác thực & Quản lý phiên (Auth Domain)</h3>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Quan hệ 1-N giữa tài khoản quản trị viên và chuỗi phiên làm việc (Refresh Tokens)</p>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-around; gap: 20px;">
        <div style="border: 2px solid #ef4444; border-radius: 10px; overflow: hidden; width: 340px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: #ef4444; color: white; font-weight: 700; font-size: 16px; padding: 10px 14px; text-align: center;">
            users (Bảng Quản trị viên)
          </div>
          <div style="background: white; padding: 12px; font-size: 14px; font-family: Consolas, monospace; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#b91c1c; font-weight:700;">id (PK)</span><span style="color:#64748b;">BIGINT</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a; font-weight:600;">email (UK)</span><span style="color:#64748b;">VARCHAR(160)</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a;">password_hash</span><span style="color:#64748b;">VARCHAR(255)</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a;">role</span><span style="color:#64748b;">VARCHAR(50)</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a;">failed_attempts</span><span style="color:#64748b;">INT</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color:#0f172a;">locked_until</span><span style="color:#64748b;">TIMESTAMP</span></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div style="background: #fee2e2; border: 1.5px solid #fca5a5; color: #991b1b; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-align: center;">
            1 — N<br>(Sở hữu phiên)
          </div>
          <div style="font-size: 12px; color: #dc2626; margin-top: 8px; text-align: center; max-width: 140px; font-weight: 600;">
            ON DELETE CASCADE<br>Khóa ngoại user_id
          </div>
        </div>

        <div style="border: 2px solid #ef4444; border-radius: 10px; overflow: hidden; width: 340px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: #ef4444; color: white; font-weight: 700; font-size: 16px; padding: 10px 14px; text-align: center;">
            refresh_tokens (Bảng Phiên)
          </div>
          <div style="background: white; padding: 12px; font-size: 14px; font-family: Consolas, monospace; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#b91c1c; font-weight:700;">id (PK)</span><span style="color:#64748b;">BIGINT</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#dc2626; font-weight:700;">user_id (FK)</span><span style="color:#64748b;">BIGINT</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a; font-weight:600;">token_hash (UK)</span><span style="color:#64748b;">VARCHAR(255)</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a;">expires_at</span><span style="color:#64748b;">TIMESTAMP</span></div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9;"><span style="color:#0f172a;">revoked</span><span style="color:#64748b;">BOOLEAN</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color:#0f172a;">created_at</span><span style="color:#64748b;">TIMESTAMP</span></div>
          </div>
        </div>
      </div>
    </div>
    `
  },
  {
    name: 'diagram_erd_portfolio.png',
    width: 950,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-sizing: border-box; width: 900px;">
      <div style="text-align: center; margin-bottom: 18px;">
        <h3 style="margin: 0; color: #1e40af; font-size: 20px; font-weight: 700; text-transform: uppercase;">Sơ đồ 5.2: ERD Phân hệ Hồ sơ cá nhân & Năng lực (Profile & Portfolio Domain)</h3>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Quan hệ 1-N giữa thực thể trung tâm profile và 5 danh mục thành phần năng lực</p>
      </div>

      <div style="margin: 0 auto 16px auto; width: 520px; border: 2.5px solid #2563eb; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: #2563eb; color: white; font-weight: 700; font-size: 16px; padding: 8px 14px; text-align: center;">
          THỰC THỂ GỐC: profile (Thông tin cá nhân & Tiểu sử)
        </div>
        <div style="background: #f8fafc; padding: 10px 16px; font-size: 13px; color: #334155; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-family: Consolas, monospace;">
          <div><b style="color:#1d4ed8;">id (PK)</b>: BIGINT</div>
          <div><b>full_name</b>: VARCHAR(120)</div>
          <div><b>title</b>: VARCHAR(160)</div>
          <div><b>email</b>: VARCHAR(160)</div>
          <div><b>avatar_url</b>: VARCHAR(500)</div>
          <div><b>years_experience</b>: INT</div>
          <div><b>cv_url</b>: VARCHAR(500)</div>
          <div><b>typing_roles</b>: TEXT</div>
        </div>
      </div>

      <div style="text-align: center; color: #2563eb; font-weight: 700; font-size: 14px; margin-bottom: 14px;">
        ▼ QUAN HỆ 1 — N (MỘT HỒ SƠ CHỨA NHIỀU THỰC THỂ CON ĐỘC LẬP) ▼
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 10px;">
        <div style="border: 1.5px solid #3b82f6; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #3b82f6; color: white; font-weight: 700; font-size: 14px; padding: 6px; text-align: center;">skills</div>
          <div style="padding: 10px 8px; font-size: 12px; font-family: Consolas, monospace; color: #334155; line-height: 1.6;">
            <div><b style="color:#2563eb;">id (PK)</b></div>
            <div>name</div>
            <div>category</div>
            <div>proficiency</div>
            <div>icon</div>
            <div>sort_order</div>
          </div>
        </div>

        <div style="border: 1.5px solid #3b82f6; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #3b82f6; color: white; font-weight: 700; font-size: 14px; padding: 6px; text-align: center;">experiences</div>
          <div style="padding: 10px 8px; font-size: 12px; font-family: Consolas, monospace; color: #334155; line-height: 1.6;">
            <div><b style="color:#2563eb;">id (PK)</b></div>
            <div>company</div>
            <div>role</div>
            <div>period</div>
            <div>tech_stack</div>
            <div>sort_order</div>
          </div>
        </div>

        <div style="border: 1.5px solid #3b82f6; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #3b82f6; color: white; font-weight: 700; font-size: 14px; padding: 6px; text-align: center;">projects</div>
          <div style="padding: 10px 8px; font-size: 12px; font-family: Consolas, monospace; color: #334155; line-height: 1.6;">
            <div><b style="color:#2563eb;">id (PK)</b></div>
            <div>name</div>
            <div>tech_stack</div>
            <div>demo_url</div>
            <div>featured</div>
            <div>sort_order</div>
          </div>
        </div>

        <div style="border: 1.5px solid #3b82f6; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #3b82f6; color: white; font-weight: 700; font-size: 14px; padding: 6px; text-align: center;">education</div>
          <div style="padding: 10px 8px; font-size: 12px; font-family: Consolas, monospace; color: #334155; line-height: 1.6;">
            <div><b style="color:#2563eb;">id (PK)</b></div>
            <div>institution</div>
            <div>degree</div>
            <div>field</div>
            <div>years</div>
            <div>gpa</div>
          </div>
        </div>

        <div style="border: 1.5px solid #3b82f6; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #3b82f6; color: white; font-weight: 700; font-size: 14px; padding: 6px; text-align: center;">certifications</div>
          <div style="padding: 10px 8px; font-size: 12px; font-family: Consolas, monospace; color: #334155; line-height: 1.6;">
            <div><b style="color:#2563eb;">id (PK)</b></div>
            <div>name</div>
            <div>issuer</div>
            <div>issue_date</div>
            <div>credential_url</div>
            <div>sort_order</div>
          </div>
        </div>
      </div>
    </div>
    `
  },
  {
    name: 'diagram_erd_blog.png',
    width: 900,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; padding: 24px; border-radius: 12px; border: 1.5px solid #cbd5e1; box-sizing: border-box; width: 850px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #7c2d12; font-size: 20px; font-weight: 700; text-transform: uppercase;">Sơ đồ 5.3: ERD Phân hệ Blog, Tương tác & Giám sát (Engagement Domain)</h3>
        <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Quản lý xuất bản bài viết kỹ thuật, thông điệp người xem và nhật ký truy cập</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
        <div style="border: 2px solid #ea580c; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: #ea580c; color: white; font-weight: 700; font-size: 15px; padding: 10px 12px; text-align: center;">
            posts (Bài viết Blog)
          </div>
          <div style="background: white; padding: 12px; font-size: 13px; font-family: Consolas, monospace; line-height: 1.6;">
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b style="color:#c2410c;">id (PK)</b>: BIGINT</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>title</b>: VARCHAR(255)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>slug (UK)</b>: VARCHAR(255)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>summary</b>: TEXT</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>content</b>: TEXT (MD)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>published</b>: BOOLEAN</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>views_count</b>: INT</div>
            <div style="padding: 3px 0;"><b>sort_order</b>: INT</div>
          </div>
        </div>

        <div style="border: 2px solid #059669; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: #059669; color: white; font-weight: 700; font-size: 15px; padding: 10px 12px; text-align: center;">
            contact_messages (Hộp thư)
          </div>
          <div style="background: white; padding: 12px; font-size: 13px; font-family: Consolas, monospace; line-height: 1.6;">
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b style="color:#047857;">id (PK)</b>: BIGINT</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>name</b>: VARCHAR(120)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>email</b>: VARCHAR(160)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>subject</b>: VARCHAR(200)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>message</b>: TEXT</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>is_read</b>: BOOLEAN</div>
            <div style="padding: 3px 0;"><b>created_at</b>: TIMESTAMP</div>
          </div>
        </div>

        <div style="border: 2px solid #7c3aed; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: #7c3aed; color: white; font-weight: 700; font-size: 15px; padding: 10px 12px; text-align: center;">
            analytics_events (Sự kiện)
          </div>
          <div style="background: white; padding: 12px; font-size: 13px; font-family: Consolas, monospace; line-height: 1.6;">
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b style="color:#6d28d9;">id (PK)</b>: BIGINT</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>event_type</b>: VARCHAR(50)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>path</b>: VARCHAR(255)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>referrer</b>: VARCHAR(500)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>ip_hash</b>: VARCHAR(64)</div>
            <div style="padding: 3px 0; border-bottom: 1px solid #f1f5f9;"><b>device_type</b>: VARCHAR(50)</div>
            <div style="padding: 3px 0;"><b>created_at</b>: TIMESTAMP</div>
          </div>
        </div>
      </div>
    </div>
    `
  }
];

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  let execPath = undefined;
  if (fs.existsSync(edgePath)) execPath = edgePath;
  else if (fs.existsSync(chromePath)) execPath = chromePath;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: execPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 2 });

  for (const d of diagrams) {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 20px; background: transparent; display: inline-block; }
        </style>
      </head>
      <body>
        ${d.html}
      </body>
      </html>
    `;
    await page.setContent(fullHtml, { waitUntil: 'load' });
    const element = await page.$('body > div');
    const dest = path.join(outputDir, d.name);
    await element.screenshot({ path: dest, omitBackground: false });
    console.log('[RENDERED]', d.name);
  }

  await browser.close();
  console.log('[SUCCESS] All diagram images saved to:', outputDir);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
