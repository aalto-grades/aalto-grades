-- SPDX-FileCopyrightText: 2023 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_translation (course_id, language, course_name, created_at, updated_at) VALUES
(1, 'EN', 'O1', NOW(), NOW()),
(1, 'FI', 'O1', NOW(), NOW()),
(1, 'SV', 'O1', NOW(), NOW()),
(2, 'EN', 'Y1', NOW(), NOW()),
(2, 'FI', 'Y1', NOW(), NOW()),
(2, 'SV', 'Y1', NOW(), NOW()),
(3, 'EN', 'Example & grades', NOW(), NOW()),
(3, 'FI', 'Esimerkki & arvosanat', NOW(), NOW()),
(3, 'SV', 'Example & grades', NOW(), NOW()),
(4, 'EN', 'Example', NOW(), NOW()),
(4, 'FI', 'Esimerkki', NOW(), NOW()),
(4, 'SV', 'Example', NOW(), NOW());