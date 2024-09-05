-- SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

insert into public.course_task (course_part_id, name, days_valid, max_grade, created_at, updated_at) values
(1, 'Tier A', NULL, NULL, NOW(), NOW()),
(1, 'Tier B', NULL, NULL, NOW(), NOW()),
(1, 'Tier C', NULL, NULL, NOW(), NOW()),
(2, 'Round 1', NULL, NULL, NOW(), NOW()),
(2, 'Round 2', NULL, NULL, NOW(), NOW()),
(2, 'Round 3', NULL, NULL, NOW(), NOW()),
(2, 'Round 4', NULL, NULL, NOW(), NOW()),
(2, 'Round 5', NULL, NULL, NOW(), NOW()),
(2, 'Round 6', NULL, NULL, NOW(), NOW()),
(2, 'Round 7', NULL, NULL, NOW(), NOW()),
(2, 'Round 8', NULL, NULL, NOW(), NOW()),
(2, 'Bonus Round', NULL, NULL, NOW(), NOW()),
(2, 'Substitute 1', NULL, NULL, NOW(), NOW()),
(2, 'Substitute 2', NULL, NULL, NOW(), NOW()),
(2, 'Substitute 3', NULL, NULL, NOW(), NOW()),
(2, 'Substitute 4', NULL, NULL, NOW(), NOW()),
(3, 'Exercise 1', NULL, 10, NOW(), NOW()),
(3, 'Exercise 2', NULL, 10, NOW(), NOW()),
(4, 'Exam points', NULL, 20, NOW(), NOW());


SELECT setval('course_part_id_seq', COALESCE((SELECT MAX(id)+1 FROM course_part), 1), false);