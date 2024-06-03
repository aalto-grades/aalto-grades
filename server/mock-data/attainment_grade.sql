-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

-- ALTER TABLE public.attainment_grade DISABLE TRIGGER ALL;

-- INSERT INTO public.attainment_grade (user_id, course_part_id, grader_id, grade, date, expiry_date, created_at, updated_at, comment, sisu_export_date) VALUES
-- (8, 29, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
-- (8, 30, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL),
-- (8, 31, 2, 10, '2024-04-01', '2025-04-01', NOW(), NOW(), NULL, NULL);


-- ALTER TABLE public.attainment_grade ENABLE TRIGGER ALL;
