-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_instance (course_id, assessment_model_id, sisu_course_instance_id, grading_scale, starting_period, ending_period, type, start_date, end_date, created_at, updated_at) VALUES
(1, 1, 'aalto-CUR-165388-3874205', 'NUMERICAL', 'I', 'II', 'LECTURE', '2022-09-05', '2022-12-09', NOW(), NOW()),
(2, 2, 'aalto-CUR-165768-3874205', 'PASS_FAIL', 'III', 'IV', 'LECTURE', '2023-01-05', '2023-04-23', NOW(), NOW()),
(3, 3, 'aalto-CUR-263388-3874205', 'NUMERICAL', 'I', 'II', 'LECTURE', '2022-09-03', '2022-12-11', NOW(), NOW()),
(3, 4, null, 'NUMERICAL', 'I', 'II', 'LECTURE', '2021-09-03', '2021-12-11', NOW(), NOW()),
(4, 5, 'aalto-CUR-865388-3874205', 'NUMERICAL', 'I', 'II', 'LECTURE', '2021-09-03', '2021-12-11', NOW(), NOW()),
(4, 6, 'aalto-CUR-965388-3874205', 'NUMERICAL', 'I', 'II', 'LECTURE', '2020-09-03', '2020-12-11', NOW(), NOW()),
(4, 7, 'aalto-CUR-465338-3874205', 'NUMERICAL', 'II', 'II', 'EXAM', '2022-12-03', '2022-12-03', NOW(), NOW()),
(5, 8, null, 'NUMERICAL', 'III', 'V', 'LECTURE', '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 9, 'aalto-CUR-165768-3854405', 'PASS_FAIL', 'II', 'II', 'LECTURE', '2023-02-12', '2023-02-12', NOW(), NOW()),
(1, 10, 'aalto-CUR-165458-3879305', 'PASS_FAIL', 'I', 'II', 'LECTURE', '2022-09-05', '2022-12-09', NOW(), NOW()),
(2, 11, null, 'NUMERICAL', 'III', 'IV', 'LECTURE', '2023-01-05', '2023-04-23', NOW(), NOW()),
(1, 12, 'aalto-CUR-169778-3874205', 'PASS_FAIL', 'I', 'II', 'LECTURE', '2022-09-03', '2022-12-11', NOW(), NOW()),
(4, 13, 'aalto-CUR-165389-3474205', 'NUMERICAL', 'II', 'II', 'EXAM', '2022-12-03', '2022-12-03', NOW(), NOW()),
(5, 14, null, 'NUMERICAL', 'III', 'V', 'LECTURE', '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 15, 'aalto-CUR-165389-3874205', 'NUMERICAL', 'III', 'III', 'EXAM', '2023-02-20', '2023-02-20', NOW(), NOW()),
(4, 16, 'aalto-CUR-134385-3874205', 'PASS_FAIL', 'II', 'II', 'EXAM', '2022-12-03', '2022-12-03', NOW(), NOW()),
(1, 17, 'aalto-CUR-165078-3864205', 'NUMERICAL', 'III', 'V', 'LECTURE', '2023-02-06', '2023-05-19', NOW(), NOW()),
(6, 18, 'aalto-CUR-165488-3869805', 'PASS_FAIL', 'II', 'II', 'EXAM', '2023-02-28', '2023-02-28', NOW(), NOW()),
(1, 19, null, 'PASS_FAIL', 'I', 'II', 'LECTURE', '2022-05-05', '2022-12-09', NOW(), NOW()),
(5, 20, 'aalto-CUR-169788-3875405', 'NUMERICAL', 'III', 'IV', 'LECTURE', '2023-01-05', '2023-04-23', NOW(), NOW()),
(1, 21, null, 'PASS_FAIL', 'V', 'V', 'EXAM', '2023-06-03', '2023-06-03', NOW(), NOW()),
(6, 22, null, 'PASS_FAIL', 'V', 'V', 'EXAM', '2023-06-03', '2023-06-03', NOW(), NOW()),
(6, 23, null, 'PASS_FAIL', 'V', 'V', 'EXAM', '2023-06-03', '2023-06-03', NOW(), NOW()),
(8, 29, null, 'NUMERICAL', 'III', 'V', 'LECTURE', '2023-01-07', '2023-05-05', NOW(), NOW()),
(8, 42, null, 'NUMERICAL', 'III', 'V', 'LECTURE', '2023-01-07', '2023-05-05', NOW(), NOW());