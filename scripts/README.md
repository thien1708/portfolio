# Bộ công cụ sinh Tài liệu Đặc tả SRS (Word .docx & Sơ đồ kiến trúc)

Thư mục này chứa toàn bộ mã nguồn tự động hóa việc kết xuất tài liệu đặc tả SRS từ file Markdown [docs/SRS.md](../docs/SRS.md) sang file Word chuẩn Microsoft OpenXML [docs/SRS_Portfolio_TranVuThien.docx](../docs/SRS_Portfolio_TranVuThien.docx).

---

## Cấu trúc thư mục

```
scripts/
├── package.json          # Danh mục thư viện phụ thuộc (docx, puppeteer)
├── render_diagrams.js    # Tự động kết xuất 6 sơ đồ kiến trúc độ nét cao Retina sang docs/images/
├── generate_docx.js      # Parser Markdown & bộ dựng file Word .docx chuẩn OpenXML
└── README.md             # Tài liệu hướng dẫn sử dụng
```

---

## Hướng dẫn cài đặt và sử dụng

### 1. Cài đặt thư viện phụ thuộc
Khi thực hiện lần đầu, mở terminal tại thư mục `scripts/` và chạy lệnh:
```bash
npm install
```

### 2. Các lệnh thực thi

- **Tái tạo toàn bộ (Sơ đồ + File Word):**
  ```bash
  npm run generate
  ```

- **Chỉ tái tạo sơ đồ kiến trúc (độ phân giải 2x Retina):**
  ```bash
  npm run render:diagrams
  ```

- **Chỉ tái tạo file Word .docx từ docs/SRS.md:**
  ```bash
  npm run build:docx
  ```

---

## Các đặc điểm kỹ thuật nổi bật
1. **Chuẩn bảng biểu OpenXML:** Khắc phục triệt để lỗi cấu trúc bảng bằng cách tính toán và gán chiều rộng tuyệt đối `DXA` cho từng cột, phân chia `Paragraph` đa dòng mượt mà.
2. **Sơ đồ phân rã trực quan:** Tách biệt 6 sơ đồ kiến trúc độc lập (Kiến trúc phân tầng, Public Web, Admin CMS, ERD Auth, ERD Portfolio, ERD Blog) với cỡ chữ lớn (14px - 18px), đảm bảo rõ nét khi xem ở mức phóng to 100% trong Word.
