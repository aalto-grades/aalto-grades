insert into public.attainment (course_id, name, days_valid, created_at, updated_at) values
(1, 'Tier A', 365, NOW(), NOW()),
(1, 'Tier B', 365, NOW(), NOW()),
(1, 'Tier C', 365, NOW(), NOW()),
(2, 'Round 1', 365, NOW(), NOW()),
(2, 'Round 2', 365, NOW(), NOW()),
(2, 'Round 3', 365, NOW(), NOW()),
(2, 'Round 4', 365, NOW(), NOW()),
(2, 'Round 5', 365, NOW(), NOW()),
(2, 'Round 6', 365, NOW(), NOW()),
(2, 'Round 7', 365, NOW(), NOW()),
(2, 'Round 8', 365, NOW(), NOW()),
(2, 'Bonus Round', 365, NOW(), NOW()),
(2, 'Substitute 1', 365, NOW(), NOW()),
(2, 'Substitute 2', 365, NOW(), NOW()),
(2, 'Substitute 3', 365, NOW(), NOW()),
(2, 'Substitute 4', 365, NOW(), NOW()),
(3, 'Exercise 1', 365, NOW(), NOW()),
(3, 'Exercise 2', 365, NOW(), NOW()),
(3, 'Exam', 365, NOW(), NOW()),
(4, 'Round 1', 365, NOW(), NOW()),
(4, 'Round 2', 365, NOW(), NOW()),
(4, 'Round 3', 365, NOW(), NOW());

SELECT setval('attainment_id_seq', COALESCE((SELECT MAX(id)+1 FROM attainment), 1), false);