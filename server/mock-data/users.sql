-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

-- DISCLAIMER
-- All names and student numbers portrayed in this file are fictitious.
-- Any resemblance to actual person or student id, living or dead, active or inactive, is purely coincidental.
INSERT INTO public.user (email, student_number, password, name, created_at, updated_at, role) VALUES
('admin@aalto.fi', NULL, '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Andy Admin', NOW(), NOW(), 'ADMIN'),
('teacher@aalto.fi', '123456', '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Timmy Teacher', NOW(), NOW(), 'USER'),
('assistant@aalto.fi', '234567', '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Alex Assistant', NOW(), NOW(), 'USER'),
('student@aalto.fi', '345678', '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Scarlett Student', NOW(), NOW(), 'USER'),

-- e2e test
('idpuser@aalto.fi', '435215', null, 'idp user', NOW(), NOW(), 'USER');