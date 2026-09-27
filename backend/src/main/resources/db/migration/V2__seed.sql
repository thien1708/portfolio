-- Initial seed data extracted from CV of Tran Vu Thien.
-- Admin user is NOT seeded here: created at startup via AdminUserInitializer.

INSERT INTO profile (full_name, title, summary, email, phone, location, cv_url, typing_roles, years_experience)
VALUES ('Trần Vũ Thiện',
        'Software Development Engineer',
        'Software Engineer with experience in developing web applications using Java Spring Boot, Angular, and Oracle/MySQL. Experienced in working in enterprise environments, developing backend and frontend features, processing ETL data, writing optimized SQL queries, and coordinating acceptance testing with relevant outsourcing partners. Seeking to grow toward a Full-Stack Developer / Distributed Systems Engineer career path.',
        'tranvuthien1708@gmail.com',
        '0942457820',
        'Hanoi, Vietnam',
        '/cv.pdf',
        'Software Development Engineer,Full-Stack Developer,Spring Boot & Angular Developer,Distributed Systems Engineer',
        4);

INSERT INTO skills (name, category, proficiency, sort_order) VALUES
    ('Java', 'Backend', 90, 0),
    ('Spring Boot', 'Backend', 90, 1),
    ('REST API', 'Backend', 90, 2),
    ('Hibernate', 'Backend', 85, 3),
    ('JPA', 'Backend', 85, 4),
    ('Angular', 'Frontend', 85, 5),
    ('Html', 'Frontend', 85, 6),
    ('CSS', 'Frontend', 80, 7),
    ('Oracle', 'Database', 85, 8),
    ('MySQL', 'Database', 85, 9),
    ('Cassandra', 'Database', 75, 10),
    ('MinIO', 'Database', 75, 11),
    ('SQL Optimization', 'Database', 85, 12),
    ('Kafka', 'Messaging / Integration', 75, 13),
    ('gRPC', 'Messaging / Integration', 75, 14),
    ('Redis', 'Messaging / Integration', 80, 15),
    ('Git', 'Tools', 85, 16),
    ('SVN', 'Tools', 80, 17),
    ('Postman', 'Tools', 85, 18),
    ('Pentaho Spoon', 'Tools', 80, 19),
    ('AI Coding Agents', 'Tools', 85, 20),
    ('IDE', 'Tools', 85, 21);

INSERT INTO experiences (company, role, period, description, tech_stack, sort_order) VALUES
    ('Viettel Telecom', 'Software Development Engineer', '08/2024 – Present',
'• Developed backend and frontend features for internal business support systems using Java Spring Boot, Angular, and Oracle Database.
• Participated in data processing and built ETL pipelines to support internal applications.
• Wrote and optimized SQL queries to efficiently retrieve and process data from databases.
• Coordinated with stakeholders to manage, test, and conduct acceptance of deliverables provided by outsourcing partners.
• Contributed to the integration and operation of scalable backend components and technologies such as gRPC, Kafka, and Redis.',
     'Java, Spring Boot, Angular, Oracle, Pentaho, gRPC, Kafka, Redis', 0),
    ('Migi Technology', 'Java Web Developer', '01/2023 – 07/2024',
'• Developed both Backend and Frontend using Java Spring Boot, Angular, and MySQL for various web applications in school management and e-commerce.
• Designed and implemented RESTful APIs to handle core business logic and data processing for multiple client projects.
• Worked directly with clients and project stakeholders to gather requirements, estimate effort, and deliver features on schedule.',
     'Java, Spring Boot, Angular, MySQL, REST API', 1),
    ('HCLTech Vietnam', 'Java Intern', '03/2022 – 12/2022',
'• Learned full-stack web application development using Java Spring Boot combined with Angular. Participated in company training activities and programs.
• Practiced building REST APIs with Spring Boot and connecting them to relational databases.
• Gained hands-on experience with Angular fundamentals, including components, services, and routing.',
     'Java, Spring Boot, Angular, REST API', 2);

INSERT INTO projects (name, period, description, tech_stack, featured, sort_order) VALUES
    ('Viettel Telecom – Commission Payment System', '08/2024 – Present',
'• Maintained and enhanced Backend services for the commission payment system using Spring Boot.
• Developed and maintained ETL workflows using Pentaho Spoon to extract, transform, and load business data for reporting and internal systems.
• Coordinated with and reviewed deliverables from outsourced partners, ensuring compliance with business requirements and technical standards.',
     'Java Spring Boot, Oracle Database, Pentaho (ETL)', TRUE, 0),
    ('Dashboard for the Ministry of Education and Sports of Laos', '04/2024 – 07/2024',
'• Developed both Backend APIs and Frontend interfaces for key modules such as Account Management and School Management,...
• Designed RESTful APIs using Spring Boot to handle business logic, and data processing.
• Implemented dynamic UI components using Angular.
• Wrote and optimized SQL queries in MySQL to retrieve and process system data efficiently.',
     'Java Spring Boot, Angular, MySQL', TRUE, 1),
    ('E-commerce & Online Examination System (Ulearn)', '05/2023 – 03/2024',
'• Built and maintained full-stack features for modules including Course Topic Management, Seller Course Management, and Course Library.
• Designed RESTful APIs using Spring Boot to handle business logic, and data processing.
• Implemented dynamic UI components using Angular.
• Wrote and optimized SQL queries in MySQL to retrieve and process system data efficiently.',
     'Java Spring Boot, Angular, MySQL', TRUE, 2),
    ('School Management System (LaosEdu)', '01/2023 – 04/2023',
'• Developed both Backend and Frontend features for the School Management module, covering school and class data management.
• Developed the Exam & Score Management module, allowing teachers and administrators to manage exams, input, and track student scores.
• Designed RESTful APIs using Spring Boot to handle business logic and data processing for these modules.
• Wrote and optimized SQL queries in MySQL to retrieve and process system data efficiently.',
     'Java Spring Boot, Angular, MySQL', FALSE, 3);

INSERT INTO education (school, degree, period, description, sort_order) VALUES
    ('VNU University of Engineering and Technology',
     'Electronics and Communications Engineering Technology',
     '08/2018 – 06/2022',
     'Major: Electronics and Telecommunications Engineering (Advanced Program)', 0);

INSERT INTO certifications (name, issuer, issued, sort_order) VALUES
    ('TOEIC 855', 'ETS', NULL, 0);

INSERT INTO posts (title, slug, summary, content, cover_image_url, tags, published, views_count, reading_time_minutes, sort_order, created_at, updated_at)
VALUES
(
    'Xây dựng Backend Production-Ready với Spring Boot 3.5 và Java 21 GraalVM',
    'xay-dung-backend-spring-boot-35-java-21',
    'Chia sẻ kinh nghiệm thiết kế kiến trúc phân tầng sạch (Clean Architecture), bảo mật JWT với Refresh Token rotation, in-memory rate limiting và Caffeine Caching trong dự án thực tế.',
    '# Xây dựng Backend Production-Ready với Spring Boot 3.5 và Java 21

Khi phát triển các hệ thống backend hiện đại, việc đảm bảo đồng thời **hiệu năng cao**, **bảo mật vững chắc** và **khả năng bảo trì lâu dài** là yếu tố sống còn đối với một Software Engineer.

Trong bài viết này, mình muốn chia sẻ các kỹ thuật cốt lõi được áp dụng trong kiến trúc backend của hệ thống:

## 1. Tối ưu hiệu năng với Java 21 & Caffeine Cache

Spring Boot 3.5 tận dụng tối đa sức mạnh của Java 21:
- Sử dụng **Virtual Threads** cho các tác vụ I/O blocking.
- Tích hợp **Caffeine Cache** in-memory để phục vụ các endpoint public với thời gian phản hồi dưới **5ms**.

```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("profile", "projects", "posts");
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(Duration.ofMinutes(15)));
        return manager;
    }
}
```

## 2. Bảo mật đa lớp (Defense in Depth)

1. **Stateless JWT** với Refresh Token Rotation được lưu trong `HttpOnly`, `SameSite=Strict` cookie.
2. **Rate Limiting** theo IP bằng thuật toán Token Bucket (Bucket4j) ngăn chặn brute force và DoS.
3. **Database Migration** tự động với Flyway đảm bảo tính nhất quán dữ liệu qua các môi trường.

## Kết luận

Kiến trúc backend hiện đại không chỉ là việc chọn framework phổ biến, mà là sự thấu hiểu về **Data Flow**, **Security Boundary** và khả năng tối ưu tài nguyên phần cứng.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'Java, Spring Boot, Architecture, Performance',
    TRUE,
    142,
    4,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'Làm chủ Angular 20: Tối ưu hoá Rendering với Signals và Deferrable Views',
    'lam-chu-angular-20-signals-va-defer',
    'Hướng dẫn áp dụng triệt để Angular Signals, ChangeDetectionStrategy.OnPush, và @defer blocks để đạt điểm Core Web Vitals tối đa 100/100.',
    '# Làm chủ Angular 20: Tối ưu hoá Rendering với Signals và Deferrable Views

Angular trong những năm gần đây đã có bước chuyển mình ngoạn mục với kiến trúc **Fine-Grained Reactivity** dựa trên Signals.

## 1. Tại sao Signals thay đổi cuộc chơi?

Với cơ chế Change Detection truyền thống của Zone.js, mỗi khi có một event (như click chuột hay HTTP response), Angular phải duyệt lại toàn bộ cây component từ root để tìm kiếm thay đổi.

Khi chuyển sang **Signals**:
- Angular biết chính xác node nào trong DOM cần cập nhật.
- Không cần trigger kiểm tra toàn bộ ứng dụng.
- Dễ dàng kết hợp với `computed()` và `effect()`.

```typescript
// Định nghĩa signal trong Angular 20
readonly count = signal(0);
readonly double = computed(() => this.count() * 2);

increment() {
  this.count.update(n => n + 1);
}
```

## 2. Lazy Loading siêu mượt với @defer

Khối lệnh `@defer` cho phép tải các component nặng (như 3D Canvas, biểu đồ thống kê, Markdown viewer) chỉ khi người dùng cuộn đến hoặc tương tác:

```html
@defer (on viewport) {
  <app-heavy-chart [data]="analyticsData()" />
} @placeholder {
  <div class="skeleton h-64 w-full"></div>
}
```

## Tổng kết

Việc kết hợp **Signals**, **OnPush change detection**, và **Tailwind CSS** mang lại trải nghiệm người dùng cực kỳ mượt mà với 60fps trên mọi thiết bị.',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    'Angular, TypeScript, Frontend, Performance',
    TRUE,
    98,
    3,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
