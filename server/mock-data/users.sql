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

('teacher1@aalto.fi', '352772', 'oybqmgvqaftydpssvufmdpiqyaknxqhpeoqavmcuryaaswntzovmeqadyunz', 'Amanda Germain', '2020-10-15', '2021-7-2', 'USER'),
('teacher2@aalto.fi', '476617', 'bdrvtzjvbdgzefoofabxkttdqfokxopkvevlprmrdavrlbqqnvwprylymjlp', 'Beth Holmes', '2020-7-9', '2021-4-1', 'USER'),
('teacher3@aalto.fi', '344625', 'onlcozbrcxrrevpcqqreqknwwrstjeymjdfnwzndgqgykkwgwouzaedqmdvr', 'Mark Ortiz', '2020-5-17', '2021-3-10', 'USER'),

-- Grade tests
('carolyn.janek@aalto.fi', '325235', 'kmeiaknfjjaakqgscpfqcggqmukkvlrjxxpdsnnhrgiqshbeeocxfvnfkfqp', 'Carolyn Janek', '2020-5-8', '2021-10-1', 'USER'),
('vonda.morgan@aalto.fi', '826139', 'dkatkrzhspaekfmebongpsebjvqlzvtlwydkooptebpteccwcvwauvnbpyzt', 'Vonda Morgan', '2020-11-18', '2022-9-15', 'USER'),
('monica.johnson@aalto.fi', '849946', 'rdsznqhfgkkrqhpoprmtggcnbuztxdqqamlzchpwgfsnfmxlixhirknwlwdk', 'Monica Johnson', '2020-3-14', '2021-6-19', 'USER'),
('heather.mangone@aalto.fi', '183958', 'xkotqxilnlfhfpinogcvjxlpeqitvkjjcmbmighswnqfbtwxumacgcubtetx', 'Heather Mangone', '2020-8-9', '2021-4-13', 'USER'),
('william.thomas@aalto.fi', '686426', 'skrchoimqmwqwrdnfwlesycmdhvutumygqwrlwqsxpsaubshqtukmukifucs', 'William Thomas', '2020-10-6', '2021-10-10', 'USER'),
('kandi.burgos@aalto.fi', '753213', 'ddyjoytlsajwurkukvlapgqnltdlbabmppqhxhuxkfwtiugpnsdauasrnled', 'Kandi Burgos', '2020-10-12', '2022-4-14', 'USER'),
('philip.lewis@aalto.fi', '279337', 'zhpuamenetlprdllzqbokkshlwfgjtlvnkhzrhszhwguyxdppxtionouktwc', 'Philip Lewis', '2020-2-2', '2022-5-16', 'USER'),
('toney.ham@aalto.fi', '495298', 'hbvoandilxduusmpibctrpvwwpgeagzfopfqcumrngnpeqbonbpsbinjzxxk', 'Toney Ham', '2020-4-10', '2022-10-18', 'USER'),
('carl.kleckner@aalto.fi', '638843', 'jltmyjyklorsnpdodxxuicpskvwbqprcgvwwesixgubjecmxhsdsztfyedyr', 'Carl Kleckner', '2022-11-14', '2021-4-4', 'USER'),
('mary.christie@aalto.fi', '216384', 'dsyqoqhkqkolscsudvnamtwmdryftfltgxlxcmtmolodgghygxjvuxhscvun', 'Mary Christie', '2020-2-14', '2022-10-10', 'USER'),

('lawrence.smith@aalto.fi', '573857', 'fuqsorgejwmeslcgxelvuoionwkrflyoabwcsduktgxlhqmtuoxpygpopeph', 'Lawrence Smith', '2021-6-6', '2022-1-10', 'USER'), -- id 18
('joshua.mann@aalto.fi', '169639', 'emzrjejhikwpmrhhgpoeitnbwpzfjbmdlchmqmdhzigtyvcqoedwdcmlnjlk', 'Joshua Mann', '2020-1-15', '2022-7-8', 'USER'),
('theresa.lowery@aalto.fi', '581953', 'elomazckdrcmoibgpynvdivoakvpfhgqwrwbhdpjyaihddcwhdlukrasajnh', 'Theresa Lowery', '2021-5-19', '2022-6-4', 'USER'),
('richard.young@aalto.fi', '156214', 'qecpydzstiwapxhdhuunadzxbvcstlxbxudtpnpmtlgkscakfekbaemthmbl', 'Richard Young', '2020-3-6', '2020-11-16', 'USER'),
('april.velazquez@aalto.fi', '519334', 'rmfgjsluikcikphceibmmbebvnaeujkmzrhoamcbejinougkmjvjiihporgo', 'April Velazquez', '2021-8-6', '2022-9-17', 'USER'),
('james.hillsgrove@aalto.fi', '112239', 'ejwrcljhucqpbmtihaavkgrlxdectwmsxdfbfokdvipjlqrvansnvawedara', 'James Hillsgrove', '2022-1-14', '2022-2-11', 'USER'),

-- User test
('arthur.james@aalto.fi', '118345', 'pxdgrricyrevfyskewnjaicpgcghuiafbpaijrbqkhzzwlinehjaqvmksbwr', 'Arthur James', '2022-6-10', '2022-5-20', 'USER'), -- id 24

-- e2e test
('idpuser@aalto.fi', '435215', null, 'idp user', '2023-1-24', '2023-1-25', 'USER');