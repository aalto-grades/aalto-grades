-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT
ALTER TABLE public.attainment_grade DISABLE TRIGGER ALL;

INSERT INTO public.attainment_grade (user_id, attainment_id, grader_id, grade, date, expiry_date, created_at, updated_at, comment, sisu_export_date) VALUES
(6, 29, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(6, 30, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(6, 31, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),

(6, 32, 2, 8, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(6, 33, 2, 2, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(6, 34, 2, 5, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(7, 32, 2, 2, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(7, 33, 2, 7, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(7, 34, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(8, 32, 2, 1, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(8, 33, 2, 5, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(8, 34, 2, 9, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(9, 32, 2, 0, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(9, 33, 2, 5, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(9, 34, 2, 9, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(10, 32, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(10, 33, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(10, 34, 2, 1, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(11, 32, 2, 5, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(11, 33, 2, 2, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(11, 34, 2, 9, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(12, 32, 2, 6, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(12, 33, 2, 9, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(12, 34, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(13, 32, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(13, 33, 2, 9, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(13, 34, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(14, 32, 2, 5, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(14, 33, 2, 7, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(14, 34, 2, 5, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(15, 32, 2, 7, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(15, 33, 2, 2, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(15, 34, 2, 4, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),

(6, 35, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(6, 36, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(6, 37, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),

(7, 29, 2, 10, '2023-01-01', '2023-12-31', NOW(), NOW(), NULL, NULL), -- id: 37
(8, 30, 2, 10, '2022-01-01', '2023-01-01', NOW(), NOW(), NULL, NULL),
(9, 31, 2, 10, '2100-01-01', '2100-12-31', NOW(), NOW(), NULL, NULL),
(10, 29, 2, 10, '2099-01-01', '2100-01-01', NOW(), NOW(), NULL, NULL),

(11, 29, 2, 10, '2022-02-01', '2025-04-02', NOW(), NOW(), NULL, NULL),
(11, 30, 2, 9, '2022-02-02', '2024-03-01', NOW(), NOW(), NULL, NULL),
(12, 29, 2, 10, '2022-02-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(12, 29, 2, 7, '2022-05-01', '2024-04-01', NOW(), NOW(), NULL, NULL),
(12, 29, 2, 5, '2022-04-01', '2023-04-01', NOW(), NOW(), NULL, NULL);



ALTER TABLE public.attainment_grade ENABLE TRIGGER ALL;
