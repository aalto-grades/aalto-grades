-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT
ALTER TABLE public.final_grade DISABLE TRIGGER ALL;

INSERT INTO public.final_grade (user_id, course_id, assessment_model_id, grader_id, grade, sisu_export_date, date, created_at, updated_at) VALUES
(6,  8, 7, 2, 2, NULL, NOW(), NOW(), NOW()),
(7,  8, 7, 2, 3, NULL, NOW(), NOW(), NOW()),
(8,  8, 7, 2, 2, NULL, NOW(), NOW(), NOW()),
(9,  8, 7, 2, 0, NULL, NOW(), NOW(), NOW()),
(10, 8, 7, 2, 0, NULL, NOW(), NOW(), NOW()),
(11, 8, 7, 2, 3, NULL, NOW(), NOW(), NOW()),
(12, 8, 7, 2, 5, NULL, NOW(), NOW(), NOW()),
(13, 8, 7, 2, 5, NULL, NOW(), NOW(), NOW()),
(14, 8, 7, 2, 3, NULL, NOW(), NOW(), NOW()),
(15, 8, 7, 2, 2, NULL, NOW(), NOW(), NOW());
