-- SPDX-FileCopyrightText: 2023 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.course_translation (course_id, language, course_name, created_at, updated_at) VALUES
((SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY'), 'EN', 'O1', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY'), 'FI', 'O1', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A1234-DUMMY'), 'SV', 'O1', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY'), 'EN', 'Y1', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY'), 'FI', 'Y1', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A2345-DUMMY'), 'SV', 'Y1', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), 'EN', 'Example & grades', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), 'FI', 'Esimerkki & arvosanat', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), 'SV', 'Exempel & betyg', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY'), 'EN', 'Example', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY'), 'FI', 'Esimerkki', NOW(), NOW()),
((SELECT id FROM public.course WHERE course_code='CS-A4567-DUMMY'), 'SV', 'Exempel', NOW(), NOW());