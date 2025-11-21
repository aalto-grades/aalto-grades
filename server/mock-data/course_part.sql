-- SPDX-FileCopyrightText: 2024 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

insert into public.course_part (course_id, name, expiry_date, created_at, updated_at) values
((SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY'), 'Exercises 2024', '2025-01-01', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY'), 'Exercises 2024', '2025-01-01', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), 'Exercises 2024', '2025-01-01', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), 'Exam 2024', '2025-01-01', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY'), 'Exercises 2024', '2025-01-01', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY'), 'Exam 2024', '2025-01-01', NOW(), NOW());


SELECT setval('course_part_id_seq', COALESCE((SELECT MAX(id)+1 FROM course_part), 1), false);