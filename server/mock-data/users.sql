-- SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

-- DISCLAIMER
-- All names and student numbers portrayed in this file are fictitious.
-- Any resemblance to actual person or student id, living or dead, active or inactive, is purely coincidental.
INSERT INTO public.user (email, student_number, password, name, created_at, updated_at, role) VALUES
('admin@aalto.fi', NULL, '$argon2i$v=19$m=4096,t=3,p=1$8GviC+qQHFqBG1PJZd+PCg$jWayurCVLCvJPn//oNR+5UIiQWqMhpNRJbrLaqIk1gM', 'Andy Admin', '2023-1-23', '2023-1-24', 'ADMIN'),
('teacher@aalto.fi', '123456', '$argon2i$v=19$m=4096,t=3,p=1$8GviC+qQHFqBG1PJZd+PCg$jWayurCVLCvJPn//oNR+5UIiQWqMhpNRJbrLaqIk1gM', 'Timmy Teacher', '2023-1-23', '2023-1-24', 'USER'),
('assistant@aalto.fi', '234567', '$argon2i$v=19$m=4096,t=3,p=1$8GviC+qQHFqBG1PJZd+PCg$jWayurCVLCvJPn//oNR+5UIiQWqMhpNRJbrLaqIk1gM', 'Alex Assistant', '2023-1-23', '2023-1-24', 'USER'),
('student@aalto.fi', '345678', '$argon2i$v=19$m=4096,t=3,p=1$8GviC+qQHFqBG1PJZd+PCg$jWayurCVLCvJPn//oNR+5UIiQWqMhpNRJbrLaqIk1gM', 'Scarlett Student', '2023-1-23', '2023-1-24', 'USER'),

-- e2e test
('idpuser@aalto.fi', '435215', null, 'idp user', '2023-1-24', '2023-1-25', 'USER');