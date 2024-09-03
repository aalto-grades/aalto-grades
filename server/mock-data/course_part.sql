-- SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

insert into public.course_part (course_id, name, expiry_date, created_at, updated_at) values
(1, 'Exercises 2024', '2025-01-01', NOW(), NOW()),
(2, 'Exercises 2024', '2025-01-01', NOW(), NOW()),
(3, 'Exercises 2024', '2025-01-01', NOW(), NOW()),
(3, 'Exam 2024', '2025-01-01', NOW(), NOW());


SELECT setval('course_part_id_seq', COALESCE((SELECT MAX(id)+1 FROM course_part), 1), false);