-- SPDX-FileCopyrightText: 2024 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_role (user_id, course_id, role, created_at, updated_at) VALUES
(2, 1, 'TEACHER', NOW(), NOW()),
(4, 1, 'STUDENT', NOW(), NOW()),
(2, 2, 'TEACHER', NOW(), NOW()),
(2, 3, 'TEACHER', NOW(), NOW()),
(4, 3, 'STUDENT', NOW(), NOW()),
(2, 4, 'TEACHER', NOW(), NOW()),
(4, 4, 'STUDENT', NOW(), NOW()),

(6, 3, 'STUDENT', NOW(), NOW()),
(7, 3, 'STUDENT', NOW(), NOW()),
(8, 3, 'STUDENT', NOW(), NOW()),
(9, 3, 'STUDENT', NOW(), NOW()),
(10, 3, 'STUDENT', NOW(), NOW()),
(11, 3, 'STUDENT', NOW(), NOW()),
(12, 3, 'STUDENT', NOW(), NOW()),
(13, 3, 'STUDENT', NOW(), NOW()),
(14, 3, 'STUDENT', NOW(), NOW()),
(15, 3, 'STUDENT', NOW(), NOW()),
(16, 3, 'STUDENT', NOW(), NOW()),
(17, 3, 'STUDENT', NOW(), NOW()),
(18, 3, 'STUDENT', NOW(), NOW()),
(19, 3, 'STUDENT', NOW(), NOW()),
(20, 3, 'STUDENT', NOW(), NOW()),
(21, 3, 'STUDENT', NOW(), NOW()),
(22, 3, 'STUDENT', NOW(), NOW()),
(23, 3, 'STUDENT', NOW(), NOW()),
(24, 3, 'STUDENT', NOW(), NOW()),
(25, 3, 'STUDENT', NOW(), NOW()),
(26, 3, 'STUDENT', NOW(), NOW()),
(27, 3, 'STUDENT', NOW(), NOW()),
(28, 3, 'STUDENT', NOW(), NOW()),
(29, 3, 'STUDENT', NOW(), NOW()),
(30, 3, 'STUDENT', NOW(), NOW()),
(31, 3, 'STUDENT', NOW(), NOW()),
(32, 3, 'STUDENT', NOW(), NOW()),
(33, 3, 'STUDENT', NOW(), NOW()),
(34, 3, 'STUDENT', NOW(), NOW()),
(35, 3, 'STUDENT', NOW(), NOW()),
(36, 3, 'STUDENT', NOW(), NOW()),
(37, 3, 'STUDENT', NOW(), NOW()),
(38, 3, 'STUDENT', NOW(), NOW()),
(39, 3, 'STUDENT', NOW(), NOW()),
(40, 3, 'STUDENT', NOW(), NOW()),
(41, 3, 'STUDENT', NOW(), NOW()),
(42, 3, 'STUDENT', NOW(), NOW()),
(43, 3, 'STUDENT', NOW(), NOW()),
(44, 3, 'STUDENT', NOW(), NOW()),
(45, 3, 'STUDENT', NOW(), NOW()),
(46, 3, 'STUDENT', NOW(), NOW()),
(47, 3, 'STUDENT', NOW(), NOW()),
(48, 3, 'STUDENT', NOW(), NOW()),
(49, 3, 'STUDENT', NOW(), NOW()),
(50, 3, 'STUDENT', NOW(), NOW()),
(51, 3, 'STUDENT', NOW(), NOW()),
(52, 3, 'STUDENT', NOW(), NOW()),
(53, 3, 'STUDENT', NOW(), NOW()),
(54, 3, 'STUDENT', NOW(), NOW()),
(55, 3, 'STUDENT', NOW(), NOW());

INSERT INTO public.course_role (user_id, course_id, role, created_at, updated_at, expiry_date) VALUES
(3, 1, 'ASSISTANT', NOW(), NOW(), CURRENT_DATE + INTERVAL '40 days'),
(3, 3, 'ASSISTANT', NOW(), NOW(), CURRENT_DATE + INTERVAL '40 days'),
(3, 4, 'ASSISTANT', NOW(), NOW(), CURRENT_DATE + INTERVAL '40 days');