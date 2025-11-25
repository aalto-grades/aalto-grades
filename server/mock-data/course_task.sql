-- SPDX-FileCopyrightText: 2024 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

insert into public.course_task (course_part_id, name, days_valid, max_grade, created_at, updated_at) values
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY') AND name='Exercises 2024'), 'Tier A', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY') AND name='Exercises 2024'), 'Tier B', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY') AND name='Exercises 2024'), 'Tier C', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 1', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 2', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 3', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 4', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 5', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 6', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 7', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Round 8', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Bonus Round', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Substitute 1', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Substitute 2', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Substitute 3', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY') AND name='Exercises 2024'), 'Substitute 4', NULL, NULL, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY') AND name='Exercises 2024'), 'Exercise 1', NULL, 10, NOW(), NOW()), -- 17
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY') AND name='Exercises 2024'), 'Exercise 2', NULL, 10, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY') AND name='Exam 2024'), 'Exam points', NULL, 20, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY') AND name='Exercises 2024'), 'Exercise 1', NULL, 10, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY') AND name='Exercises 2024'), 'Exercise 2', NULL, 10, NOW(), NOW()),
((SELECT id FROM public.course_part WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY') AND name='Exam 2024'), 'Exam points', NULL, 20, NOW(), NOW());


SELECT setval('course_part_id_seq', COALESCE((SELECT MAX(id)+1 FROM course_part), 1), false);