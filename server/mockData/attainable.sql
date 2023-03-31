-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.attainable (course_id, course_instance_id, attainable_id, name, date, expiry_date, created_at, updated_at) VALUES
(1, 1, null, 'test assignment 1.1', '2022-01-13', '2023-04-23', NOW(), NOW()),
(2, 2, null, 'test assignment tree', '2022-05-08', '2023-04-23', NOW(), NOW()),
(3, 3, null, 'test assignment 3.1', '2022-08-05', '2023-04-23', NOW(), NOW()),
(4, 5, null, 'test assignment 4.1', '2022-04-18', '2023-04-23', NOW(), NOW()),
(5, 8, null, 'test assignment 5.1', '2022-05-09', '2023-04-23', NOW(), NOW()),
(1, 1, null, 'test assignment 1.2', '2022-01-05', '2023-04-23', NOW(), NOW()),
(2, 2, 2, 'test assignment 1st level child 1', '2022-05-12', '2023-04-23', NOW(), NOW()),
(3, 3, null, 'test assignment 3.2', '2022-08-05', '2023-04-23', NOW(), NOW()),
(4, 5, null, 'test assignment 4.2', '2022-04-02', '2023-04-23', NOW(), NOW()),
(5, 8, null, 'test assignment 5.2', '2022-05-03', '2023-04-23', NOW(), NOW()),
(1, 1, null, 'test assignment 1.3', '2022-01-05', '2023-04-23', NOW(), NOW()),
(2, 2, 2, 'test assignment 1st level child 2', '2022-05-13', '2023-04-23', NOW(), NOW()),
(3, 3, null, 'test assignment 3.3', '2022-08-26', '2023-04-23', NOW(), NOW()),
(4, 5, null, 'test assignment 4.3', '2022-04-25', '2023-04-23', NOW(), NOW()),
(5, 8, null, 'test assignment 5.3', '2022-05-15', '2023-04-23', NOW(), NOW()),
(1, 1, null, 'test assignment 1.4', '2022-01-05', '2023-04-23', NOW(), NOW()),
(1, 1, null, 'test assignment 1.5', '2022-01-05', '2023-04-23', NOW(), NOW()),
(1, 1, null, 'test assignment 1.6', '2022-01-05', '2023-04-23', NOW(), NOW());