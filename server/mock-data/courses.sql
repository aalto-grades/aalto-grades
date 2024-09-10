-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course (course_code, min_credits, max_credits, grading_scale, language_of_instruction, created_at, updated_at) VALUES
('CS-A1234', 5, 5, 'NUMERICAL', 'EN', NOW(), NOW()), -- O1
('CS-A2345', 5, 5, 'NUMERICAL', 'EN', NOW(), NOW()), -- Y1
('CS-A3456', 5, 5, 'NUMERICAL', 'EN', NOW(), NOW()); -- Example