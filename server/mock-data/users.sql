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
('idpuser@aalto.fi', '435215', null, 'idp user', NOW(), NOW(), 'USER'),

-- 50 random users
('adam.bardin@aalto.fi', '241142', 'wdloledkxzomwpsosflljdmutultvwlkbjefcyinyhyeqrhdqpkroszuwcwv', 'Adam Bardin', NOW(), NOW(), 'USER'),
('albert.klingenberger@aalto.fi', '812472', 'dvomjtaidzbwipszwqvckswgwmaufthnqgmrvokklabmskvgludgdavatztr', 'Albert Klingenberger', NOW(), NOW(), 'USER'),
('alberta.kratky@aalto.fi', '935116', 'xbjyxcjcietbamnqharvwhuoijauhegrvngtsliucdgrzrdpmnzzcwcohdll', 'Alberta Kratky', NOW(), NOW(), 'USER'),
('alta.ott@aalto.fi', '773858', 'iykcwlrrftbteevzfiyntihmowlikenlriyxowjsfjulkktcxshkcjiqntrq', 'Alta Ott', NOW(), NOW(), 'USER'),
('amanda.germain@aalto.fi', '352772', 'oybqmgvqaftydpssvufmdpiqyaknxqhpeoqavmcuryaaswntzovmeqadyunz', 'Amanda Germain', NOW(), NOW(), 'USER'),
('angela.gomez@aalto.fi', '963929', 'xbxwnqtkpswgpcjwompztlyyfpdfmntjybqckfxckcbcqhqnafipkvnfxyvv', 'Angela Gomez', NOW(), NOW(), 'USER'),
('april.velazquez@aalto.fi', '519334', 'rmfgjsluikcikphceibmmbebvnaeujkmzrhoamcbejinougkmjvjiihporgo', 'April Velazquez', NOW(), NOW(), 'USER'),
('arthur.james@aalto.fi', '118345', 'pxdgrricyrevfyskewnjaicpgcghuiafbpaijrbqkhzzwlinehjaqvmksbwr', 'Arthur James', NOW(), NOW(), 'USER'),
('beth.holmes@aalto.fi', '476617', 'bdrvtzjvbdgzefoofabxkttdqfokxopkvevlprmrdavrlbqqnvwprylymjlp', 'Beth Holmes', NOW(), NOW(), 'USER'),
('blanca.hubbell@aalto.fi', '537522', 'yablmmaqdnftkaxtjeppzlhojpftxeopgvxstdtlpzrwbsqhmehuimsevalu', 'Blanca Hubbell', NOW(), NOW(), 'USER'),
('brian.obannon@aalto.fi', '482499', 'hraurhgtfigwuahgnekzrqslzhtqznytmylpuepzxoljcahkuvscjgkstpdf', 'Brian Obannon', NOW(), NOW(), 'USER'),
('bryan.crockett@aalto.fi', '185228', 'xjnszwfrsojuxzazyocawthehytksweqxycbfqdyoykbtsfvxrwwavvcsdcy', 'Bryan Crockett', NOW(), NOW(), 'USER'),
('carl.kleckner@aalto.fi', '638843', 'jltmyjyklorsnpdodxxuicpskvwbqprcgvwwesixgubjecmxhsdsztfyedyr', 'Carl Kleckner', NOW(), NOW(), 'USER'),
('carolyn.janek@aalto.fi', '325235', 'kmeiaknfjjaakqgscpfqcggqmukkvlrjxxpdsnnhrgiqshbeeocxfvnfkfqp', 'Carolyn Janek', NOW(), NOW(), 'USER'),
('catherine.gregory@aalto.fi', '915741', 'yobkbhgxzqggufheeubciaaaoccevxfllatwrfbxepstbsebnrdcyxttzyho', 'Catherine Gregory', NOW(), NOW(), 'USER'),
('christine.oakes@aalto.fi', '784619', 'dezwahyjgmirqtujtoedcbbsjhvltqtldhrgrqqupzgpsuoklobvbfcjjsbt', 'Christine Oakes', NOW(), NOW(), 'USER'),
('darrin.duncan@aalto.fi', '765877', 'hddumakfpbungbqriibnncawciimosodjimjryzgrcfanoowltpgvbostezf', 'Darrin Duncan', NOW(), NOW(), 'USER'),
('dolores.bulloch@aalto.fi', '743554', 'uixhcmhzivqpdkvagbwlguxpisrstxpujdgapzqmedtmwjriqignwlubkmxn', 'Dolores Bulloch', NOW(), NOW(), 'USER'),
('donald.palma@aalto.fi', '878552', 'ndkvzzwozaywalangcqketnwtvplarownmtdscxrdtpekipisfjnzdplwqeh', 'Donald Palma', NOW(), NOW(), 'USER'),
('everett.dennis@aalto.fi', '126693', 'jvibdujarynbfywjstbqgcwxubsgkexwadnsnyvpbzrbqyxvxrlyuikizfpx', 'Everett Dennis', NOW(), NOW(), 'USER'),
('heather.mangone@aalto.fi', '183958', 'xkotqxilnlfhfpinogcvjxlpeqitvkjjcmbmighswnqfbtwxumacgcubtetx', 'Heather Mangone', NOW(), NOW(), 'USER'),
('james.hillsgrove@aalto.fi', '112239', 'ejwrcljhucqpbmtihaavkgrlxdectwmsxdfbfokdvipjlqrvansnvawedara', 'James Hillsgrove', NOW(), NOW(), 'USER'),
('jazmine.joyce@aalto.fi', '261258', 'jnegbicwagqklzoccmasarbfmrnpenbklnuchqjjrkyvkdsfzrweobrquloc', 'Jazmine Joyce', NOW(), NOW(), 'USER'),
('jesse.carter@aalto.fi', '522214', 'eteczealchlghsgonyhufhwdpnydffscyqmmcapmwfmlxrrgpqrvqfikoely', 'Jesse Carter', NOW(), NOW(), 'USER'),
('john.bergeron@aalto.fi', '949181', 'fcxomppmbabsqdqbxzubwlsroqbkaneqvqsbcxhkanfrxgvcuxnalucqtazs', 'John Bergeron', NOW(), NOW(), 'USER'),
('john.ibara@aalto.fi', '655233', 'bxggjeonbhtzhampjnuhfazqftncipmzvhxzoqlkazxsvwhthmkckeaeksca', 'John Ibara', NOW(), NOW(), 'USER'),
('john.orick@aalto.fi', '167178', 'rbiyztokloghgxwpqgzoaivaxgjuqktqbkzfzgijcqsxmgflrperzkcxgkna', 'John Orick', NOW(), NOW(), 'USER'),
('jose.gann@aalto.fi', '511733', 'kvtgjfjolvcjohtjuwxopghexlcxycchkwrjcvpgihgjdynguziqnjpxzsil', 'Jose Gann', NOW(), NOW(), 'USER'),
('joseph.ingber@aalto.fi', '827525', 'wjcmleqcfcvybciciokhoozyeefpqlplyypgrifgbdydwewsirfuavhmtlti', 'Joseph Ingber', NOW(), NOW(), 'USER'),
('joseph.sales@aalto.fi', '545761', 'ocguxnczfadduewvcmsmdwazoxphbiblfixwbkojkzsigclvfdiftofawchx', 'Joseph Sales', NOW(), NOW(), 'USER'),
('joshua.mann@aalto.fi', '169639', 'emzrjejhikwpmrhhgpoeitnbwpzfjbmdlchmqmdhzigtyvcqoedwdcmlnjlk', 'Joshua Mann', NOW(), NOW(), 'USER'),
('kandi.burgos@aalto.fi', '753213', 'ddyjoytlsajwurkukvlapgqnltdlbabmppqhxhuxkfwtiugpnsdauasrnled', 'Kandi Burgos', NOW(), NOW(), 'USER'),
('kathleen.jackson@aalto.fi', '531231', 'wilsqwzdfolsgfezkebplkqfcmwdoqcagkuscaswcvbmmwyijohsggtuzggv', 'Kathleen Jackson', NOW(), NOW(), 'USER'),
('laila.schulz@aalto.fi', '349825', 'owtghhhbjjsnixdvdzvoctxodttfhelmmhxmnsihnrprmvlssibzpshuvovg', 'Laila Schulz', NOW(), NOW(), 'USER'),
('lawrence.smith@aalto.fi', '573857', 'fuqsorgejwmeslcgxelvuoionwkrflyoabwcsduktgxlhqmtuoxpygpopeph', 'Lawrence Smith', NOW(), NOW(), 'USER'),
('lynette.hester@aalto.fi', '866567', 'ekghsyqcurvchcamcferfuvxcixcbwgdezlaspaycynuyfpvehfeblvxdmxz', 'Lynette Hester', NOW(), NOW(), 'USER'),
('mark.ortiz@aalto.fi', '344625', 'onlcozbrcxrrevpcqqreqknwwrstjeymjdfnwzndgqgykkwgwouzaedqmdvr', 'Mark Ortiz', NOW(), NOW(), 'USER'),
('mary.christie@aalto.fi', '216384', 'dsyqoqhkqkolscsudvnamtwmdryftfltgxlxcmtmolodgghygxjvuxhscvun', 'Mary Christie', NOW(), NOW(), 'USER'),
('monica.johnson@aalto.fi', '849946', 'rdsznqhfgkkrqhpoprmtggcnbuztxdqqamlzchpwgfsnfmxlixhirknwlwdk', 'Monica Johnson', NOW(), NOW(), 'USER'),
('patricia.stevens@aalto.fi', '446858', 'wbzmztuccuqitjqwsaruqkyaqhulfguvardtrxquwpbsybyjrgbqostfvqaj', 'Patricia Stevens', NOW(), NOW(), 'USER'),
('philip.lewis@aalto.fi', '279337', 'zhpuamenetlprdllzqbokkshlwfgjtlvnkhzrhszhwguyxdppxtionouktwc', 'Philip Lewis', NOW(), NOW(), 'USER'),
('richard.young@aalto.fi', '156214', 'qecpydzstiwapxhdhuunadzxbvcstlxbxudtpnpmtlgkscakfekbaemthmbl', 'Richard Young', NOW(), NOW(), 'USER'),
('scott.dennis@aalto.fi', '585911', 'aqycbsttqtjvgszqzjkqpzakqrmrobkjpvxgzgutkwllgsfbejgmtjfwhuzf', 'Scott Dennis', NOW(), NOW(), 'USER'),
('scott.kennedy@aalto.fi', '793673', 'drtfqclzzjdgtqpxconjtoghvquzgkxokhvwhuckqfgzwhquqfyxahbwtirb', 'Scott Kennedy', NOW(), NOW(), 'USER'),
('stephen.dunn@aalto.fi', '184243', 'thvyxdqdoirryrogmlhxyaxqzgybbwxgppkybydeyzokidgbdkuohpsgmaog', 'Stephen Dunn', NOW(), NOW(), 'USER'),
('theresa.lowery@aalto.fi', '581953', 'elomazckdrcmoibgpynvdivoakvpfhgqwrwbhdpjyaihddcwhdlukrasajnh', 'Theresa Lowery', NOW(), NOW(), 'USER'),
('thomas.siegel@aalto.fi', '348576', 'fdikhibqkxievifkgaemvztdvztebuqglcjmftcxvootvvegrkzwyeyycgbw', 'Thomas Siegel', NOW(), NOW(), 'USER'),
('toney.ham@aalto.fi', '495298', 'hbvoandilxduusmpibctrpvwwpgeagzfopfqcumrngnpeqbonbpsbinjzxxk', 'Toney Ham', NOW(), NOW(), 'USER'),
('vonda.morgan@aalto.fi', '826139', 'dkatkrzhspaekfmebongpsebjvqlzvtlwydkooptebpteccwcvwauvnbpyzt', 'Vonda Morgan', NOW(), NOW(), 'USER'),
('william.thomas@aalto.fi', '686426', 'skrchoimqmwqwrdnfwlesycmdhvutumygqwrlwqsxpsaubshqtukmukifucs', 'William Thomas', NOW(), NOW(), 'USER');