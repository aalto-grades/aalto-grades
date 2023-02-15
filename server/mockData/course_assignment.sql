-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_assignment (course_instance_id, name, execution_date, expiry_date, created_at, updated_at) VALUES
(1, 'test assignment 1.1', '2022-01-13', '2023-04-23', NOW(), NOW()),
(2, 'test assignment 2.1', '2022-05-08', '2023-04-23', NOW(), NOW()),
(3, 'test assignment 3.1', '2022-08-05', '2023-04-23', NOW(), NOW()),
(4, 'test assignment 4.1', '2022-04-18', '2023-04-23', NOW(), NOW()),
(5, 'test assignment 5.1', '2022-05-09', '2023-04-23', NOW(), NOW()),
(1, 'test assignment 1.2', '2022-01-05', '2023-04-23', NOW(), NOW()),
(2, 'test assignment 2.2', '2022-05-12', '2023-04-23', NOW(), NOW()),
(3, 'test assignment 3.2', '2022-08-05', '2023-04-23', NOW(), NOW()),
(4, 'test assignment 4.2', '2022-04-02', '2023-04-23', NOW(), NOW()),
(5, 'test assignment 5.2', '2022-05-03', '2023-04-23', NOW(), NOW()),
(1, 'test assignment 1.3', '2022-01-05', '2023-04-23', NOW(), NOW()),
(2, 'test assignment 2.3', '2022-05-13', '2023-04-23', NOW(), NOW()),
(3, 'test assignment 3.3', '2022-08-26', '2023-04-23', NOW(), NOW()),
(4, 'test assignment 4.3', '2022-04-25', '2023-04-23', NOW(), NOW()),
(5, 'test assignment 5.3', '2022-05-15', '2023-04-23', NOW(), NOW());
