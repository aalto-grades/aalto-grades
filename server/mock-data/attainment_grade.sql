-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT
ALTER TABLE public.attainment_grade DISABLE TRIGGER ALL;

INSERT INTO public.attainment_grade (user_id, attainment_id, grader_id, grade, date, expiry_date, created_at, updated_at, comment, sisu_export_date) VALUES
(3, 1, 2, 2000, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(3, 2, 2, 600, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(3, 3, 2, 500, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(4, 1, 2, 1700, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(4, 2, 2, 300, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(4, 3, 2, 100, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(5, 1, 2, 1200, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(5, 2, 2, 150, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
(5, 3, 2, 0, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL);

ALTER TABLE public.attainment_grade ENABLE TRIGGER ALL;
