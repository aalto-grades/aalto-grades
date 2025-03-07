-- SPDX-FileCopyrightText: 2023 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

-- DISCLAIMER
-- All names and student numbers portrayed in this file are fictitious.
-- Any resemblance to actual person or student id, living or dead, active or inactive, is purely coincidental.
INSERT INTO public.user (email, student_number, password, name, idp_user, admin, created_at, updated_at) VALUES
('admin@aalto.fi', NULL, '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Andy Admin', false, true,  NOW(), NOW()),
('teacher@aalto.fi', '123456', '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Timmy Teacher', false, false, NOW(), NOW()),
('assistant@aalto.fi', '234567', '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Alex Assistant', false, false, NOW(), NOW()),
('student@aalto.fi', '345678', '$argon2id$v=19$m=19456,t=2,p=1$EP4iEokN/afMk0ZL13P5pQ$3FLJW4pkCnO2J7KE9ZEdH3Lxn1Gxg8TV7JXBDfbXNrs', 'Scarlett Student', false, false, NOW(), NOW()),

-- e2e test
('idpuser@aalto.fi', '435215', null, 'idp user', true, false, NOW(), NOW()),

-- 50 random users
('adam.bardin@aalto.fi', '241142', null, 'Adam Bardin', false, false, NOW(), NOW()),
('albert.klingenberger@aalto.fi', '812472', null, 'Albert Klingenberger', false, false, NOW(), NOW()),
('alberta.kratky@aalto.fi', '935116', null, 'Alberta Kratky', false, false, NOW(), NOW()),
('alta.ott@aalto.fi', '773858', null, 'Alta Ott', false, false, NOW(), NOW()),
('amanda.germain@aalto.fi', '352772', null, 'Amanda Germain', false, false, NOW(), NOW()),
('angela.gomez@aalto.fi', '963929', null, 'Angela Gomez', false, false, NOW(), NOW()),
('april.velazquez@aalto.fi', '519334', null, 'April Velazquez', false, false, NOW(), NOW()),
('arthur.james@aalto.fi', '118345', null, 'Arthur James', false, false, NOW(), NOW()),
('beth.holmes@aalto.fi', '476617', null, 'Beth Holmes', false, false, NOW(), NOW()),
('blanca.hubbell@aalto.fi', '537522', null, 'Blanca Hubbell', false, false, NOW(), NOW()),
('brian.obannon@aalto.fi', '482499', null, 'Brian Obannon', false, false, NOW(), NOW()),
('bryan.crockett@aalto.fi', '185228', null, 'Bryan Crockett', false, false, NOW(), NOW()),
('carl.kleckner@aalto.fi', '638843', null, 'Carl Kleckner', false, false, NOW(), NOW()),
('carolyn.janek@aalto.fi', '325235', null, 'Carolyn Janek', false, false, NOW(), NOW()),
('catherine.gregory@aalto.fi', '915741', null, 'Catherine Gregory', false, false, NOW(), NOW()),
('christine.oakes@aalto.fi', '784619', null, 'Christine Oakes', false, false, NOW(), NOW()),
('darrin.duncan@aalto.fi', '765877', null, 'Darrin Duncan', false, false, NOW(), NOW()),
('dolores.bulloch@aalto.fi', '743554', null, 'Dolores Bulloch', false, false, NOW(), NOW()),
('donald.palma@aalto.fi', '878552', null, 'Donald Palma', false, false, NOW(), NOW()),
('everett.dennis@aalto.fi', '126693', null, 'Everett Dennis', false, false, NOW(), NOW()),
('heather.mangone@aalto.fi', '183958', null, 'Heather Mangone', false, false, NOW(), NOW()),
('james.hillsgrove@aalto.fi', '112239', null, 'James Hillsgrove', false, false, NOW(), NOW()),
('jazmine.joyce@aalto.fi', '261258', null, 'Jazmine Joyce', false, false, NOW(), NOW()),
('jesse.carter@aalto.fi', '522214', null, 'Jesse Carter', false, false, NOW(), NOW()),
('john.bergeron@aalto.fi', '949181', null, 'John Bergeron', false, false, NOW(), NOW()),
('john.ibara@aalto.fi', '655233', null, 'John Ibara', false, false, NOW(), NOW()),
('john.orick@aalto.fi', '167178', null, 'John Orick', false, false, NOW(), NOW()),
('jose.gann@aalto.fi', '511733', null, 'Jose Gann', false, false, NOW(), NOW()),
('joseph.ingber@aalto.fi', '827525', null, 'Joseph Ingber', false, false, NOW(), NOW()),
('joseph.sales@aalto.fi', '545761', null, 'Joseph Sales', false, false, NOW(), NOW()),
('joshua.mann@aalto.fi', '169639', null, 'Joshua Mann', false, false, NOW(), NOW()),
('kandi.burgos@aalto.fi', '753213', null, 'Kandi Burgos', false, false, NOW(), NOW()),
('kathleen.jackson@aalto.fi', '531231', null, 'Kathleen Jackson', false, false, NOW(), NOW()),
('laila.schulz@aalto.fi', '349825', null, 'Laila Schulz', false, false, NOW(), NOW()),
('lawrence.smith@aalto.fi', '573857', null, 'Lawrence Smith', false, false, NOW(), NOW()),
('lynette.hester@aalto.fi', '866567', null, 'Lynette Hester', false, false, NOW(), NOW()),
('mark.ortiz@aalto.fi', '344625', null, 'Mark Ortiz', false, false, NOW(), NOW()),
('mary.christie@aalto.fi', '216384', null, 'Mary Christie', false, false, NOW(), NOW()),
('monica.johnson@aalto.fi', '849946', null, 'Monica Johnson', false, false, NOW(), NOW()),
('patricia.stevens@aalto.fi', '446858', null, 'Patricia Stevens', false, false, NOW(), NOW()),
('philip.lewis@aalto.fi', '279337', null, 'Philip Lewis', false, false, NOW(), NOW()),
('richard.young@aalto.fi', '156214', null, 'Richard Young', false, false, NOW(), NOW()),
('scott.dennis@aalto.fi', '585911', null, 'Scott Dennis', false, false, NOW(), NOW()),
('scott.kennedy@aalto.fi', '793673', null, 'Scott Kennedy', false, false, NOW(), NOW()),
('stephen.dunn@aalto.fi', '184243', null, 'Stephen Dunn', false, false, NOW(), NOW()),
('theresa.lowery@aalto.fi', '581953', null, 'Theresa Lowery', false, false, NOW(), NOW()),
('thomas.siegel@aalto.fi', '348576', null, 'Thomas Siegel', false, false, NOW(), NOW()),
('toney.ham@aalto.fi', '495298', null, 'Toney Ham', false, false, NOW(), NOW()),
('vonda.morgan@aalto.fi', '826139', null, 'Vonda Morgan', false, false, NOW(), NOW()),
('william.thomas@aalto.fi', '686426', null, 'William Thomas', false, false, NOW(), NOW());