-- SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

insert into public.course_task (course_part_id, name, days_valid, created_at, updated_at) values
(1, 'Tier A', NULL, NOW(), NOW()),
(1, 'Tier B', NULL, NOW(), NOW()),
(1, 'Tier C', NULL, NOW(), NOW()),
(2, 'Round 1', NULL, NOW(), NOW()),
(2, 'Round 2', NULL, NOW(), NOW()),
(2, 'Round 3', NULL, NOW(), NOW()),
(2, 'Round 4', NULL, NOW(), NOW()),
(2, 'Round 5', NULL, NOW(), NOW()),
(2, 'Round 6', NULL, NOW(), NOW()),
(2, 'Round 7', NULL, NOW(), NOW()),
(2, 'Round 8', NULL, NOW(), NOW()),
(2, 'Bonus Round', NULL, NOW(), NOW()),
(2, 'Substitute 1', NULL, NOW(), NOW()),
(2, 'Substitute 2', NULL, NOW(), NOW()),
(2, 'Substitute 3', NULL, NOW(), NOW()),
(2, 'Substitute 4', NULL, NOW(), NOW()),
(3, 'Exercise 1', NULL, NOW(), NOW()),
(3, 'Exercise 2', NULL, NOW(), NOW()),
(4, 'Exam points', NULL, NOW(), NOW()),
(5, 'Round 1', NULL, NOW(), NOW()),
(5, 'Round 2', NULL, NOW(), NOW()),
(5, 'Round 3', NULL, NOW(), NOW());


SELECT setval('course_part_id_seq', COALESCE((SELECT MAX(id)+1 FROM course_part), 1), false);