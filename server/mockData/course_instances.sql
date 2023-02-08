-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_instance (course_id, grading_type, starting_period, ending_period, teaching_method, responsible_teacher, min_credits, max_credits, start_date, end_date, created_at, updated_at) VALUES
(1, 'NUMERICAL', 'I', 'II', 'LECTURE', 1, 5, 5, '2022-09-05', '2022-12-09', NOW(), NOW()),
(2, 'PASSFAIL', 'III', 'IV', 'LECTURE', 2, 5, 5, '2023-01-05', '2023-04-23', NOW(), NOW()),
(3, 'NUMERICAL', 'I', 'II', 'LECTURE', 3, 5, 5, '2022-09-03', '2022-12-11', NOW(), NOW()),
(3, 'NUMERICAL', 'I', 'II', 'LECTURE', 3, 5, 5, '2021-09-03', '2021-12-11', NOW(), NOW()),
(4, 'NUMERICAL', 'I', 'II', 'LECTURE', 3, 5, 5, '2021-09-03', '2021-12-11', NOW(), NOW()),
(4, 'NUMERICAL', 'I', 'II', 'LECTURE', 3, 5, 5, '2020-09-03', '2020-12-11', NOW(), NOW()),
(4, 'PASSFAIL', 'II', 'II', 'EXAM', 4, 5, 5, '2022-12-03', '2022-12-03', NOW(), NOW()),
(5, 'NUMERICAL', 'III', 'V', 'LECTURE', 7, 5, 5, '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 'PASSFAIL', 'II', 'II', 'LECTURE', 6, 5, 5, '2023-02-12', '2023-02-12', NOW(), NOW()),
(1, 'PASSFAIL', 'I', 'II', 'LECTURE', 8, 5, 5, '2022-09-05', '2022-12-09', NOW(), NOW()),
(2, 'NUMERICAL', 'III', 'IV', 'LECTURE', 2, 5, 5, '2023-01-05', '2023-04-23', NOW(), NOW()),
(1, 'PASSFAIL', 'I', 'II', 'LECTURE', 9, 5, 5, '2022-09-03', '2022-12-11', NOW(), NOW()),
(4, 'NUMERICAL', 'II', 'II', 'EXAM', 10, 5, 5, '2022-12-03', '2022-12-03', NOW(), NOW()),
(5, 'NUMERICAL', 'III', 'V', 'LECTURE', 8, 5, 5, '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 'NUMERICAL', 'III', 'III', 'EXAM', 6, 5, 5, '2023-02-20', '2023-02-20', NOW(), NOW()),
(4, 'PASSFAIL', 'II', 'II', 'EXAM', 4, 5, 5, '2022-12-03', '2022-12-03', NOW(), NOW()),
(1, 'NUMERICAL', 'III', 'V', 'LECTURE', 7, 5, 5, '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 'PASSFAIL', 'II', 'II', 'EXAM', 6, 5, 5, '2023-02-28', '2023-02-28', NOW(), NOW()),
(1, 'PASSFAIL', 'I', 'II', 'LECTURE', 8, 5, 5, '2022-05-05', '2022-12-09', NOW(), NOW()),
(5, 'NUMERICAL', 'III', 'IV', 'LECTURE', 2, 5, 5, '2023-01-05', '2023-04-23', NOW(), NOW()),
(1, 'PASSFAIL', 'V', 'V', 'EXAM', 9, 5, 5, '2023-06-03', '2023-06-03', NOW(), NOW());
