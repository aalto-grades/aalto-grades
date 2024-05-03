-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_role (user_id, course_id, role, created_at, updated_at) VALUES
(2, 1, 'TEACHER', NOW(), NOW()),
(3, 1, 'ASSISTANT', NOW(), NOW()),
(4, 1, 'STUDENT', NOW(), NOW()),
(2, 2, 'TEACHER', NOW(), NOW()),
(2, 3, 'TEACHER', NOW(), NOW()),
(2, 4, 'TEACHER', NOW(), NOW());