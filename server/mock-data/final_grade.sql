-- SPDX-FileCopyrightText: 2024 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

ALTER TABLE public.final_grade DISABLE TRIGGER ALL;

INSERT INTO public.final_grade (user_id, course_id, grading_model_id, grader_id, grade, sisu_export_date, date, created_at, updated_at) VALUES
((SELECT id FROM public.user WHERE student_number='DUMMY-812472'),  (SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), (SELECT id FROM public.grading_model WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY') AND name='Final grade'), (SELECT id FROM public.user WHERE email='teacher@aalto.fi'), 2, NULL, NOW(), NOW(), NOW()),
((SELECT id FROM public.user WHERE student_number='DUMMY-935116'),  (SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), (SELECT id FROM public.grading_model WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY') AND name='Final grade'), (SELECT id FROM public.user WHERE email='teacher@aalto.fi'), 3, NULL, NOW(), NOW(), NOW()),
((SELECT id FROM public.user WHERE student_number='DUMMY-773858'),  (SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY'), (SELECT id FROM public.grading_model WHERE course_id=(SELECT id FROM public.course WHERE course_code='CS-A3456-DUMMY') AND name='Final grade'), (SELECT id FROM public.user WHERE email='teacher@aalto.fi'), 2, NULL, NOW(), NOW(), NOW());