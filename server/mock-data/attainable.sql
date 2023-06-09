-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.attainable (course_id, course_instance_id, attainable_id, name, date, expiry_date, created_at, updated_at, formula, parent_formula_params) VALUES
(1, 1, null, 'test assignment 1.1', '2022-01-13', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(2, 2, null, 'test assignment tree', '2022-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(3, 3, null, 'test assignment 3.1', '2022-08-05', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(4, 5, null, 'test assignment 4.1', '2022-04-18', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(1, 1, 1, 'test assignment 1.2', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(2, 2, 2, 'test assignment 1st level child 1', '2022-05-12', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(3, 3, 3, 'test assignment 3.2', '2022-08-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(4, 5, 4, 'test assignment 4.2', '2022-04-02', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(1, 1, 1, 'test assignment 1.3', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(2, 2, 2, 'test assignment 1st level child 2', '2022-05-13', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(3, 3, 3, 'test assignment 3.3', '2022-08-26', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(4, 5, 4, 'test assignment 4.3', '2022-04-25', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(5, 8, null, 'test assignment tree', '2022-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(5, 8, 13, 'test assignment 1st level child 1', '2022-05-12', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(5, 8, 13, 'test assignment 1st level child 2', '2022-05-13', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(1, 1, 1, 'test assignment 1.4', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(1, 1, 1, 'test assignment 1.5', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(1, 1, 1, 'test assignment 1.6', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 2 }'),
(6, 9, null, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(6, 9, 19, 'test assignment course 6, instance 9', '2022-01-05', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 3, "weight": 1 }'),
(4, 7, null, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(4, 7, 197, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.4 }'),
(4, 7, 197, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "min": 0, "max": 5, "weight": 0.6 }'),
(4, 7, 199, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.1 }'),
(4, 7, 199, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.1 }'),
(4, 7, 199, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "min": 0, "max": 5, "weight": 0.8 }'),
(4, 7, 202, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.5 }'),
(4, 7, 202, 'test assignment tree c:4 i:7', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.5 }'),
(3, 4, null, 'test assignment tree c:3 i:4', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(3, 4, 205, 'test assignment tree c:3 i:4, sub', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.5 }'),
(3, 4, 205, 'test assignment tree c:3 i:4, sub', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "min": 0, "max": 5, "weight": 0.5 }'),
(4, 6, null, 'test assignment tree c:4 i:6', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(4, 6, 208, 'test assignment tree c:4 i:6, sub', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.75 }'),
(4, 6, 208, 'test assignment tree c:4 i:6, sub', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.25 }'),
(1, 10, null, 'test assignment tree c:1 i:10', '2023-05-08', '2023-04-23', NOW(), NOW(), 'WEIGHTED_AVERAGE', NULL),
(1, 10, 211, 'test assignment tree c:1 i:10, sub', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.75 }'),
(1, 10, 211, 'test assignment tree c:1 i:10, sub', '2023-05-08', '2023-04-23', NOW(), NOW(), 'MANUAL', '{ "min": 0, "max": 5, "weight": 0.25 }');