# Frontend — Portfolio Trần Vũ Thiện

Dự án Frontend được xây dựng bằng **Angular 20** (kiến trúc Standalone Components, Signal state management), **TailwindCSS 3**, **Angular CDK** và hoạt cảnh 3D **Three.js** (lazy-loaded hero).

---

## Máy chủ phát triển (Development Server)

Để khởi động dev server trên máy cục bộ kèm proxy chuyển tiếp API sang backend:

```bash
# Cài đặt dependencies (lần đầu tiên)
npm install

# Chạy dev server (mặc định cổng 4200, proxy sang backend tại 8080)
npm start
# hoặc: npx ng serve
```

Sau khi server khởi động xong, mở trình duyệt và truy cập: `http://localhost:4200/`. Ứng dụng sẽ tự động tải lại (hot reload) mỗi khi bạn chỉnh sửa và lưu bất kỳ tệp mã nguồn nào.

> **Lưu ý về Proxy**: Tệp cấu hình `proxy.conf.json` sẽ tự động chuyển tiếp tất cả các yêu cầu bắt đầu bằng `/api` và `/uploads` sang backend Spring Boot tại `http://localhost:8080`.

---

## Tạo mới thành phần mã (Code Scaffolding)

Angular CLI cung cấp bộ sinh mã rất mạnh mẽ. Để tạo một component mới, chạy lệnh:

```bash
npx ng generate component path/ten-component
```

Để xem danh sách đầy đủ các schematics hỗ trợ (như `component`, `directive`, `pipe`, `service`...):

```bash
npx ng generate --help
```

---

## Đóng gói ứng dụng (Build)

Để đóng gói ứng dụng cho môi trường production:

```bash
npm run build
# hoặc: npx ng build
```

Các tệp tĩnh đã được tối ưu hóa (tree-shaking, minification, bundle optimization) sẽ được xuất ra tại thư mục `dist/frontend/browser/`.

---

## Kiểm thử tự động (Testing & Linting)

### Kiểm thử Unit Test

Để chạy các unit test với Karma test runner:

```bash
npm test
# hoặc: npx ng test
```

### Kiểm tra chuẩn mã nguồn (Linting)

Để kiểm tra quy tắc mã nguồn và trợ năng (accessibility) với ESLint:

```bash
npm run lint
# hoặc: npx ng lint
```

---

## Tài nguyên tham khảo

Để biết thêm chi tiết về Angular CLI và các lệnh nâng cao, tham khảo tài liệu chính thức tại: [Angular CLI Overview & Command Reference](https://angular.dev/tools/cli).
