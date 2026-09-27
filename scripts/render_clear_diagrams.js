const fs = require('fs');
const path = require('path');

const archMermaid = `flowchart LR
    APP["<b>HỆ THỐNG PORTFOLIO<br/>CÁ NHÂN & CMS</b><br/><i>Trần Vũ Thiện</i>"]

    APP --> P["<b>1. PHÂN HỆ PUBLIC WEB</b><br/>(Angular 20 Standalone)"]
    APP --> A["<b>2. PHÂN HỆ ADMIN CMS</b><br/>(Quản trị bảo mật)"]
    APP --> B["<b>3. PHÂN HỆ BACKEND</b><br/>(Spring Boot 3.5 & DB)"]

    subgraph PUB ["Giao diện Người dùng"]
        direction TB
        P1["<b>Trang chủ tương tác</b><br/>Hero 3D • About Stats<br/>Skills • Timeline • Projects"]
        P2["<b>Technical Blog</b><br/>Bài viết Markdown<br/>Syntax Highlight • Đếm view"]
        P3["<b>Kênh liên hệ</b><br/>Form gửi tin nhắn • Rate limit<br/>Gửi email xác nhận tự động"]
        P4["<b>Tiện ích trải nghiệm</b><br/>Terminal Modal • CV Modal EN/VI<br/>GitHub Stats Counter"]
    end
    P --> P1
    P --> P2
    P --> P3
    P --> P4

    subgraph ADM ["Quản trị viên"]
        direction TB
        A1["<b>Xác thực & Bảo mật</b><br/>JWT HS384 • Refresh Token<br/>Khóa tài khoản sai 5 lần"]
        A2["<b>Dashboard Analytics</b><br/>Biểu đồ lượt xem thời gian thực<br/>Thống kê thiết bị & Trang hot"]
        A3["<b>Quản lý tài nguyên CMS</b><br/>Toàn diện CRUD 6 thực thể<br/>Kéo thả sắp xếp Drag-Drop"]
        A4["<b>Hộp thư & Tệp tin</b><br/>Quản trị tin nhắn liên hệ<br/>Tải ảnh Supabase Storage"]
    end
    A --> A1
    A --> A2
    A --> A3
    A --> A4

    subgraph BE ["Dịch vụ & Dữ liệu"]
        direction TB
        B1["<b>REST API & Cache</b><br/>Payload /portfolio cache 10m<br/>Global Exception Envelope"]
        B2["<b>Bộ lọc an ninh mạng</b><br/>Bucket4j RateLimitFilter<br/>CORS • CSP • HSTS Headers"]
        B3["<b>Email bất đồng bộ</b><br/>Dual Mail Sender Service<br/>SMTP Gmail & Resend API"]
        B4["<b>CSDL & Migration</b><br/>Supabase PostgreSQL 15<br/>Flyway Migration V1 & V2"]
    end
    B --> B1
    B --> B2
    B --> B3
    B --> B4
`;

function getJpegSize(buf) {
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xFF) break;
    const marker = buf[offset + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buf.readUInt16BE(offset + 5);
      const width = buf.readUInt16BE(offset + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(offset + 2);
    offset += 2 + len;
  }
  return { width: 600, height: 400 };
}

async function renderDiagram(mermaidCode, filename) {
  const b64 = Buffer.from(mermaidCode, 'utf8').toString('base64');
  const url = `https://mermaid.ink/img/${b64}?bgColor=FFFFFF`;
  console.log(`Fetching ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch ${filename}: HTTP ${res.status} - ${errText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const size = getJpegSize(buf);
  console.log(`${filename} -> Width: ${size.width}, Height: ${size.height}, Aspect Ratio: ${(size.width / size.height).toFixed(2)}, Buffer: ${buf.length} bytes`);
  fs.writeFileSync(path.join(__dirname, '..', 'docs', 'images', filename), buf);
  return size;
}

renderDiagram(archMermaid, 'modules_diagram.png').catch(console.error);
