-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_translation (course_id, language, department, course_name, created_at, updated_at) VALUES
(1, 'EN', 'Department of Computer Science', 'O1', NOW(), NOW()),
(1, 'FI', 'Tietotekniikan laitos', 'O1', NOW(), NOW()),
(1, 'SV', 'Institutionen för datateknik', 'O1', NOW(), NOW()),
(2, 'EN', 'Department of Computer Science', 'Y1', NOW(), NOW()),
(2, 'FI', 'Tietotekniikan laitos', 'Y1', NOW(), NOW()),
(2, 'SV', 'Institutionen för datateknik', 'Y1', NOW(), NOW()),
(3, 'EN', 'Department of Computer Science', 'Example', NOW(), NOW()),
(3, 'FI', 'Tietotekniikan laitos', 'Example', NOW(), NOW()),
(3, 'SV', 'Institutionen för datateknik', 'Example', NOW(), NOW());