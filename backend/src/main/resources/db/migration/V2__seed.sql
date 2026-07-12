-- Seed data extracted from CV of Tran Vu Thien.
-- The admin user is NOT seeded here: it is created at startup from
-- ADMIN_EMAIL / ADMIN_PASSWORD environment variables (see AdminUserInitializer).

INSERT INTO profile (full_name, title, summary, email, phone, location, typing_roles, years_experience)
VALUES ('Trần Vũ Thiện',
        'Software Development Engineer',
        'Software Engineer with experience in developing web applications using Java Spring Boot, Angular, and Oracle/MySQL. Experienced in working in enterprise environments, developing backend and frontend features, processing ETL data, writing optimized SQL queries, and coordinating acceptance testing with outsourcing partners. Seeking to grow toward a Full-Stack Developer / Distributed Systems Engineer career path.',
        'tranvuthien1708@gmail.com',
        '0348741230 (Zalo: 0942457820)',
        'Hanoi, Vietnam',
        'Software Development Engineer,Full-Stack Java Developer,Spring Boot & Angular Developer',
        4);

INSERT INTO skills (name, category, proficiency, sort_order) VALUES
    ('Java', 'Backend', 90, 0),
    ('Spring Boot', 'Backend', 90, 1),
    ('REST API', 'Backend', 90, 2),
    ('Angular', 'Frontend', 85, 3),
    ('HTML', 'Frontend', 85, 4),
    ('CSS', 'Frontend', 80, 5),
    ('Oracle', 'Database', 80, 6),
    ('MySQL', 'Database', 85, 7),
    ('SQL Optimization', 'Database', 85, 8),
    ('Kafka', 'Messaging / Integration', 70, 9),
    ('gRPC', 'Messaging / Integration', 70, 10),
    ('Redis', 'Messaging / Integration', 75, 11),
    ('Git', 'Tools', 85, 12),
    ('SVN', 'Tools', 75, 13),
    ('Postman', 'Tools', 85, 14),
    ('Pentaho Spoon (ETL)', 'Tools', 75, 15),
    ('AI Coding Agents', 'Tools', 80, 16);

INSERT INTO experiences (company, role, period, description, tech_stack, sort_order) VALUES
    ('Viettel Telecom', 'Software Development Engineer', '08/2024 – Present',
'Developed backend and frontend features for internal business support systems using Java Spring Boot, Angular, and Oracle Database.
Participated in data processing and built ETL pipelines to support internal applications.
Wrote and optimized SQL queries to efficiently retrieve and process data from databases.
Coordinated with stakeholders to manage, test, and conduct acceptance of deliverables provided by outsourcing partners.
Contributed to the integration and operation of scalable backend components using gRPC, Kafka, and Redis.',
     'Java,Spring Boot,Angular,Oracle,Kafka,gRPC,Redis,Pentaho', 0),
    ('Migi Technology', 'Java Web Developer', '01/2023 – 07/2024',
'Developed both backend and frontend using Java Spring Boot, Angular, and MySQL for web applications in school management and e-commerce domains.',
     'Java,Spring Boot,Angular,MySQL', 1),
    ('HCLTech Vietnam', 'Java Intern', '03/2022 – 12/2022',
'Learned full-stack web application development using Java Spring Boot combined with Angular.
Participated in company training activities and programs.',
     'Java,Spring Boot,Angular', 2);

INSERT INTO projects (name, period, description, tech_stack, featured, sort_order) VALUES
    ('Commission Payment System (Viettel Telecom)', '08/2024 – Present',
'Maintained and enhanced backend services for the commission payment system using Spring Boot.
Developed and maintained ETL workflows using Pentaho Spoon to extract, transform, and load business data for reporting and internal systems.
Coordinated with and reviewed deliverables from outsourced partners, ensuring compliance with business requirements and technical standards.',
     'Java,Spring Boot,Oracle,Pentaho (ETL)', TRUE, 0),
    ('Dashboard for the Ministry of Education and Sports of Laos', '04/2024 – 07/2024',
'Developed both backend APIs and frontend interfaces for key modules such as Account Management and School Management.
Designed RESTful APIs using Spring Boot to handle business logic and data processing.
Implemented dynamic UI components using Angular.
Wrote and optimized SQL queries in MySQL to retrieve and process system data efficiently.',
     'Java,Spring Boot,Angular,MySQL', TRUE, 1),
    ('Ulearn – E-commerce & Online Examination System', '05/2023 – 03/2024',
'Built and maintained full-stack features for modules including Course Topic Management, Seller Course Management, and Course Library.
Designed RESTful APIs using Spring Boot to handle business logic and data processing.
Implemented dynamic UI components using Angular.
Wrote and optimized SQL queries in MySQL to retrieve and process system data efficiently.',
     'Java,Spring Boot,Angular,MySQL', FALSE, 2);

INSERT INTO education (school, degree, period, description, sort_order) VALUES
    ('VNU University of Engineering and Technology',
     'Electronics and Telecommunications Engineering (Advanced Program)',
     '08/2018 – 06/2022',
     'Electronics and Communications Engineering Technology.', 0);

INSERT INTO certifications (name, issuer, issued, sort_order) VALUES
    ('TOEIC 855', 'ETS', NULL, 0);
