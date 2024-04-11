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
(3, 'EN', 'Department of Computer Science', 'Example Average', NOW(), NOW()),
(3, 'FI', 'Tietotekniikan laitos', 'Example Average', NOW(), NOW()),
(3, 'SV', 'Institutionen för datateknik', 'Example Average', NOW(), NOW()),
(4, 'EN', 'Department of Computer Science', 'Example Sum', NOW(), NOW()),
(4, 'FI', 'Tietotekniikan laitos', 'Example Sum', NOW(), NOW()),
(4, 'SV', 'Institutionen för datateknik', 'Example Sum', NOW(), NOW()),

(5, 'EN', 'Department of Computer Science', '[Test] Normal | Average', NOW(), NOW()),
(5, 'FI', 'Tietotekniikan laitos', '[Test] Normal | Average', NOW(), NOW()),
(5, 'SV', 'Institutionen för datateknik', '[Test] Normal | Average', NOW(), NOW()),
(6, 'EN', 'Department of Computer Science', '[Test] No models | Average', NOW(), NOW()),
(6, 'FI', 'Tietotekniikan laitos', '[Test] No models | Average', NOW(), NOW()),
(6, 'SV', 'Institutionen för datateknik', '[Test] No models | Average', NOW(), NOW()),
(7, 'EN', 'Department of Computer Science', '[Test] Edit course', NOW(), NOW()),
(7, 'FI', 'Tietotekniikan laitos', '[Test] Edit course', NOW(), NOW()),
(7, 'SV', 'Institutionen för datateknik', '[Test] Edit course', NOW(), NOW()),
(8, 'EN', 'Department of Computer Science', '[Test] Final grades', NOW(), NOW()),
(8, 'FI', 'Tietotekniikan laitos', '[Test] Final grades', NOW(), NOW()),
(8, 'SV', 'Institutionen för datateknik', '[Test] Final grades', NOW(), NOW()),
(9, 'EN', 'Department of Computer Science', '[Test] Final grades 2', NOW(), NOW()),
(9, 'FI', 'Tietotekniikan laitos', '[Test] Final grades 2', NOW(), NOW()),
(9, 'SV', 'Institutionen för datateknik', '[Test] Final grades 2', NOW(), NOW()),
(10, 'EN', 'Department of Computer Science', '[Test] Final grades add', NOW(), NOW()),
(10, 'FI', 'Tietotekniikan laitos', '[Test] Final grades add', NOW(), NOW()),
(10, 'SV', 'Institutionen för datateknik', '[Test] Final grades add', NOW(), NOW());