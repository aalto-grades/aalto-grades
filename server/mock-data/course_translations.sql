-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_translation (course_id, language, department, course_name, created_at, updated_at) VALUES
(1, 'EN', 'Department of Computer Science', 'Programming 1', NOW(), NOW()),
(1, 'FI', 'Tietotekniikan laitos', 'Ohjelmointi 1', NOW(), NOW()),
(1, 'SV', 'Institutionen för datateknik', 'Programmering 1', NOW(), NOW()),
(2, 'EN', 'Department of Computer Science', 'Programming 2', NOW(), NOW()),
(2, 'FI', 'Tietotekniikan laitos', 'Programming 2', NOW(), NOW()),
(2, 'SV', 'Institutionen för datateknik', 'Programming 2', NOW(), NOW()),
(3, 'EN', 'Department of Applied Physics', 'Electromagnetism (SCI)', NOW(), NOW()),
(3, 'FI', 'Teknillisen fysiikan laitos', 'Sähkömagnetismi (SCI)', NOW(), NOW()),
(3, 'SV', 'Institutionen för teknisk fysik', 'Elektromagnetism (SCI)', NOW(), NOW()),
(4, 'EN', 'Department of Industrial Engineering and Management', 'Industrial Engineering and Management 1', NOW(), NOW()),
(4, 'FI', 'Tuotantotalouden laitos', 'Tuotantotalous 1', NOW(), NOW()),
(4, 'SV', 'Institutionen för produktionsekonomi', 'Produktionsekonomi 1', NOW(), NOW()),
(5, 'EN', 'Department of Computer Science', 'Databases', NOW(), NOW()),
(5, 'FI', 'Tietotekniikan laitos', 'Tietokannat', NOW(), NOW()),
(5, 'SV', 'Institutionen för datateknik', 'Databaser', NOW(), NOW()),
(6, 'EN', 'Department of Mathematics and Systems Analysis', 'Differential and Integral Calculus 1 (SCI)', NOW(), NOW()),
(6, 'FI', 'Matematiikan ja systeemianalyysin laitos', 'Differentiaali- ja integraalilaskenta 1 (SCI)', NOW(), NOW()),
(6, 'SV', 'Institutionen för matematik och systemanalys', 'Differential- och integralkalkyl 1 (SCI)', NOW(), NOW());
