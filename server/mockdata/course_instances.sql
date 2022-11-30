-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_instance (course_id, grading_type, teaching_period, teaching_method, responsible_teacher, start_date, end_date, created_at, updated_at) VALUES
(1, 'NUMERICAL', 'I-II', 'LECTURE', 'Herbert Garrison', '2022-09-05', '2022-12-09', NOW(), NOW()),
(2, 'PASSFAIL', 'III-IV', 'LECTURE', 'Larry Lecturer', '2023-01-05', '2023-04-23', NOW(), NOW()),
(3, 'NUMERICAL', 'I-II', 'LECTURE', 'Seymour Skinner', '2022-09-03', '2022-12-11', NOW(), NOW()),
(4, 'PASSFAIL', 'II', 'EXAM', 'Tommy Teacher', '2022-12-03', '2022-12-03', NOW(), NOW()),
(5, 'NUMERICAL', 'III-V', 'LECTURE', 'Severus Snape', '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 'PASSFAIL', 'II', 'LECTURE', 'Edna Krabappel', '2023-02-12', '2023-02-12', NOW(), NOW()),
(1, 'PASSFAIL', 'I-II', 'LECTURE', 'Herbert Garrison', '2022-09-05', '2022-12-09', NOW(), NOW()),
(2, 'NUMERICAL', 'III-IV', 'LECTURE', 'Albus Dumbledore', '2023-01-05', '2023-04-23', NOW(), NOW()),
(1, 'PASSFAIL', 'I-II', 'LECTURE', 'Seymour Skinner', '2022-09-03', '2022-12-11', NOW(), NOW()),
(4, 'NUMERICAL', 'II', 'EXAM', 'Andy Assistant', '2022-12-03', '2022-12-03', NOW(), NOW()),
(5, 'NUMERICAL', 'III-V', 'LECTURE', 'Herbert Garrison', '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 'NUMERICAL', 'III', 'EXAM', 'Edna Krabappel', '2023-02-20', '2023-02-20', NOW(), NOW()),
(4, 'PASSFAIL', 'II', 'EXAM', 'Tommy Teacher', '2022-12-03', '2022-12-03', NOW(), NOW()),
(1, 'NUMERICAL', 'III-V', 'LECTURE', 'Severus Snape', '06-02-2023', '2023-05-19', NOW(), NOW()),
(6, 'PASSFAIL', 'II', 'EXAM', 'Edna Krabappel', '2023-02-28', '2023-02-28', NOW(), NOW()),
(1, 'PASSFAIL', 'I-II', 'LECTURE', 'Herbert Garrison', '2022-05-05', '2022-12-09', NOW(), NOW()),
(5, 'NUMERICAL', 'III-IV', 'LECTURE', 'Albus Dumbledore', '2023-01-05', '2023-04-23', NOW(), NOW()),
(1, 'PASSFAIL', 'V', 'EXAM', 'Seymour Skinner', '2023-06-03', '2023-06-03', NOW(), NOW());