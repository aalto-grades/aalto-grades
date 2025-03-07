-- SPDX-FileCopyrightText: 2024 The Ossi Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.grading_model (course_id, course_part_id, name, created_at, updated_at, graph_structure) VALUES
(1, 1, 'Exercises 2024', NOW(), NOW(), '{"nodes":[{"id":"source-1","type":"source","position":{"x":12,"y":1127},"data":{}},{"id":"source-2","type":"source","position":{"x":12,"y":1284},"data":{}},{"id":"source-3","type":"source","position":{"x":12,"y":1441},"data":{}},{"id":"sum-abc","type":"addition","position":{"x":437,"y":971},"data":{}},{"id":"sum-bc","type":"addition","position":{"x":443,"y":1262},"data":{}},{"id":"sum-c","type":"addition","position":{"x":445,"y":1523},"data":{}},{"id":"best-grade","type":"max","position":{"x":1966,"y":1169},"data":{}},{"id":"sink","type":"sink","position":{"x":2273,"y":1295},"data":{}},{"id":"a-min-grade-1","type":"minpoints","position":{"x":728,"y":12},"data":{}},{"id":"b-min-grade-1","type":"minpoints","position":{"x":728,"y":192},"data":{}},{"id":"c-min-grade-1","type":"minpoints","position":{"x":728,"y":372},"data":{}},{"id":"require-all-3-grade-1","type":"require","position":{"x":1153,"y":535},"data":{}},{"id":"convert-to-grade-1","type":"stepper","position":{"x":1575,"y":765},"data":{}},{"id":"a-min-grade-2","type":"minpoints","position":{"x":728,"y":552},"data":{}},{"id":"b-min-grade-2","type":"minpoints","position":{"x":728,"y":732},"data":{}},{"id":"c-min-grade-2","type":"minpoints","position":{"x":728,"y":912},"data":{}},{"id":"require-all-3-grade-2","type":"require","position":{"x":1153,"y":866},"data":{}},{"id":"convert-to-grade-2","type":"stepper","position":{"x":1575,"y":1004},"data":{}},{"id":"a-min-grade-3","type":"minpoints","position":{"x":728,"y":1092},"data":{}},{"id":"b-min-grade-3","type":"minpoints","position":{"x":728,"y":1272},"data":{}},{"id":"c-min-grade-3","type":"minpoints","position":{"x":728,"y":1452},"data":{}},{"id":"require-all-3-grade-3","type":"require","position":{"x":1153,"y":1197},"data":{}},{"id":"convert-to-grade-3","type":"stepper","position":{"x":1575,"y":1243},"data":{}},{"id":"a-min-grade-4","type":"minpoints","position":{"x":728,"y":1632},"data":{}},{"id":"b-min-grade-4","type":"minpoints","position":{"x":728,"y":1812},"data":{}},{"id":"c-min-grade-4","type":"minpoints","position":{"x":728,"y":1992},"data":{}},{"id":"require-all-3-grade-4","type":"require","position":{"x":1153,"y":1528},"data":{}},{"id":"convert-to-grade-4","type":"stepper","position":{"x":1575,"y":1482},"data":{}},{"id":"a-min-grade-5","type":"minpoints","position":{"x":728,"y":2172},"data":{}},{"id":"b-min-grade-5","type":"minpoints","position":{"x":728,"y":2352},"data":{}},{"id":"c-min-grade-5","type":"minpoints","position":{"x":728,"y":2532},"data":{}},{"id":"require-all-3-grade-5","type":"require","position":{"x":1153,"y":1859},"data":{}},{"id":"convert-to-grade-5","type":"stepper","position":{"x":1575,"y":1721},"data":{}}],"edges":[{"id":"source-1:-sum-abc:0","source":"source-1","target":"sum-abc","sourceHandle":"source-1-source","targetHandle":"sum-abc-0"},{"id":"source-2:-sum-abc:1","source":"source-2","target":"sum-abc","sourceHandle":"source-2-source","targetHandle":"sum-abc-1"},{"id":"source-3:-sum-abc:2","source":"source-3","target":"sum-abc","sourceHandle":"source-3-source","targetHandle":"sum-abc-2"},{"id":"source-2:-sum-bc:0","source":"source-2","target":"sum-bc","sourceHandle":"source-2-source","targetHandle":"sum-bc-0"},{"id":"source-3:-sum-bc:1","source":"source-3","target":"sum-bc","sourceHandle":"source-3-source","targetHandle":"sum-bc-1"},{"id":"source-3:-sum-c:0","source":"source-3","target":"sum-c","sourceHandle":"source-3-source","targetHandle":"sum-c-0"},{"id":"best-grade:-sink:","source":"best-grade","target":"sink","sourceHandle":"best-grade-source","targetHandle":"sink"},{"id":"sum-abc:-a-min-grade-1:","source":"sum-abc","target":"a-min-grade-1","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-1"},{"id":"sum-bc:-b-min-grade-1:","source":"sum-bc","target":"b-min-grade-1","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-1"},{"id":"sum-c:-c-min-grade-1:","source":"sum-c","target":"c-min-grade-1","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-1"},{"id":"a-min-grade-1:-require-all-3-grade-1:0","source":"a-min-grade-1","target":"require-all-3-grade-1","sourceHandle":"a-min-grade-1-source","targetHandle":"require-all-3-grade-1-0"},{"id":"b-min-grade-1:-require-all-3-grade-1:1","source":"b-min-grade-1","target":"require-all-3-grade-1","sourceHandle":"b-min-grade-1-source","targetHandle":"require-all-3-grade-1-1"},{"id":"c-min-grade-1:-require-all-3-grade-1:2","source":"c-min-grade-1","target":"require-all-3-grade-1","sourceHandle":"c-min-grade-1-source","targetHandle":"require-all-3-grade-1-2"},{"id":"require-all-3-grade-1:0-convert-to-grade-1:","source":"require-all-3-grade-1","target":"convert-to-grade-1","sourceHandle":"require-all-3-grade-1-0-source","targetHandle":"convert-to-grade-1"},{"id":"convert-to-grade-1:-best-grade:0","source":"convert-to-grade-1","target":"best-grade","sourceHandle":"convert-to-grade-1-source","targetHandle":"best-grade-0"},{"id":"sum-abc:-a-min-grade-2:","source":"sum-abc","target":"a-min-grade-2","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-2"},{"id":"sum-bc:-b-min-grade-2:","source":"sum-bc","target":"b-min-grade-2","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-2"},{"id":"sum-c:-c-min-grade-2:","source":"sum-c","target":"c-min-grade-2","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-2"},{"id":"a-min-grade-2:-require-all-3-grade-2:0","source":"a-min-grade-2","target":"require-all-3-grade-2","sourceHandle":"a-min-grade-2-source","targetHandle":"require-all-3-grade-2-0"},{"id":"b-min-grade-2:-require-all-3-grade-2:1","source":"b-min-grade-2","target":"require-all-3-grade-2","sourceHandle":"b-min-grade-2-source","targetHandle":"require-all-3-grade-2-1"},{"id":"c-min-grade-2:-require-all-3-grade-2:2","source":"c-min-grade-2","target":"require-all-3-grade-2","sourceHandle":"c-min-grade-2-source","targetHandle":"require-all-3-grade-2-2"},{"id":"require-all-3-grade-2:0-convert-to-grade-2:","source":"require-all-3-grade-2","target":"convert-to-grade-2","sourceHandle":"require-all-3-grade-2-0-source","targetHandle":"convert-to-grade-2"},{"id":"convert-to-grade-2:-best-grade:1","source":"convert-to-grade-2","target":"best-grade","sourceHandle":"convert-to-grade-2-source","targetHandle":"best-grade-1"},{"id":"sum-abc:-a-min-grade-3:","source":"sum-abc","target":"a-min-grade-3","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-3"},{"id":"sum-bc:-b-min-grade-3:","source":"sum-bc","target":"b-min-grade-3","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-3"},{"id":"sum-c:-c-min-grade-3:","source":"sum-c","target":"c-min-grade-3","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-3"},{"id":"a-min-grade-3:-require-all-3-grade-3:0","source":"a-min-grade-3","target":"require-all-3-grade-3","sourceHandle":"a-min-grade-3-source","targetHandle":"require-all-3-grade-3-0"},{"id":"b-min-grade-3:-require-all-3-grade-3:1","source":"b-min-grade-3","target":"require-all-3-grade-3","sourceHandle":"b-min-grade-3-source","targetHandle":"require-all-3-grade-3-1"},{"id":"c-min-grade-3:-require-all-3-grade-3:2","source":"c-min-grade-3","target":"require-all-3-grade-3","sourceHandle":"c-min-grade-3-source","targetHandle":"require-all-3-grade-3-2"},{"id":"require-all-3-grade-3:0-convert-to-grade-3:","source":"require-all-3-grade-3","target":"convert-to-grade-3","sourceHandle":"require-all-3-grade-3-0-source","targetHandle":"convert-to-grade-3"},{"id":"convert-to-grade-3:-best-grade:2","source":"convert-to-grade-3","target":"best-grade","sourceHandle":"convert-to-grade-3-source","targetHandle":"best-grade-2"},{"id":"sum-abc:-a-min-grade-4:","source":"sum-abc","target":"a-min-grade-4","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-4"},{"id":"sum-bc:-b-min-grade-4:","source":"sum-bc","target":"b-min-grade-4","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-4"},{"id":"sum-c:-c-min-grade-4:","source":"sum-c","target":"c-min-grade-4","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-4"},{"id":"a-min-grade-4:-require-all-3-grade-4:0","source":"a-min-grade-4","target":"require-all-3-grade-4","sourceHandle":"a-min-grade-4-source","targetHandle":"require-all-3-grade-4-0"},{"id":"b-min-grade-4:-require-all-3-grade-4:1","source":"b-min-grade-4","target":"require-all-3-grade-4","sourceHandle":"b-min-grade-4-source","targetHandle":"require-all-3-grade-4-1"},{"id":"c-min-grade-4:-require-all-3-grade-4:2","source":"c-min-grade-4","target":"require-all-3-grade-4","sourceHandle":"c-min-grade-4-source","targetHandle":"require-all-3-grade-4-2"},{"id":"require-all-3-grade-4:0-convert-to-grade-4:","source":"require-all-3-grade-4","target":"convert-to-grade-4","sourceHandle":"require-all-3-grade-4-0-source","targetHandle":"convert-to-grade-4"},{"id":"convert-to-grade-4:-best-grade:3","source":"convert-to-grade-4","target":"best-grade","sourceHandle":"convert-to-grade-4-source","targetHandle":"best-grade-3"},{"id":"sum-abc:-a-min-grade-5:","source":"sum-abc","target":"a-min-grade-5","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-5"},{"id":"sum-bc:-b-min-grade-5:","source":"sum-bc","target":"b-min-grade-5","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-5"},{"id":"sum-c:-c-min-grade-5:","source":"sum-c","target":"c-min-grade-5","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-5"},{"id":"a-min-grade-5:-require-all-3-grade-5:0","source":"a-min-grade-5","target":"require-all-3-grade-5","sourceHandle":"a-min-grade-5-source","targetHandle":"require-all-3-grade-5-0"},{"id":"b-min-grade-5:-require-all-3-grade-5:1","source":"b-min-grade-5","target":"require-all-3-grade-5","sourceHandle":"b-min-grade-5-source","targetHandle":"require-all-3-grade-5-1"},{"id":"c-min-grade-5:-require-all-3-grade-5:2","source":"c-min-grade-5","target":"require-all-3-grade-5","sourceHandle":"c-min-grade-5-source","targetHandle":"require-all-3-grade-5-2"},{"id":"require-all-3-grade-5:0-convert-to-grade-5:","source":"require-all-3-grade-5","target":"convert-to-grade-5","sourceHandle":"require-all-3-grade-5-0-source","targetHandle":"convert-to-grade-5"},{"id":"convert-to-grade-5:-best-grade:4","source":"convert-to-grade-5","target":"best-grade","sourceHandle":"convert-to-grade-5-source","targetHandle":"best-grade-4"}],"nodeData":{"sink":{"title":"Exercises 2024"},"sum-c":{"title":"Sum C"},"sum-bc":{"title":"Sum BC"},"sum-abc":{"title":"Sum ABC"},"source-1":{"title":"Tier A","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"source-2":{"title":"Tier B","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"source-3":{"title":"Tier C","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"best-grade":{"title":"Best Grade","settings":{"minValue":0}},"a-min-grade-1":{"title":"A Min Grade 1","settings":{"minPoints":2000,"onFailSetting":"fail"}},"a-min-grade-2":{"title":"A Min Grade 2","settings":{"minPoints":2550,"onFailSetting":"fail"}},"a-min-grade-3":{"title":"A Min Grade 3","settings":{"minPoints":2900,"onFailSetting":"fail"}},"a-min-grade-4":{"title":"A Min Grade 4","settings":{"minPoints":3350,"onFailSetting":"fail"}},"a-min-grade-5":{"title":"A Min Grade 5","settings":{"minPoints":326,"onFailSetting":"fail"}},"b-min-grade-1":{"title":"B Min Grade 1","settings":{"minPoints":0,"onFailSetting":"fail"}},"b-min-grade-2":{"title":"B Min Grade 2","settings":{"minPoints":450,"onFailSetting":"fail"}},"b-min-grade-3":{"title":"B Min Grade 3","settings":{"minPoints":800,"onFailSetting":"fail"}},"b-min-grade-4":{"title":"B Min Grade 4","settings":{"minPoints":1250,"onFailSetting":"fail"}},"b-min-grade-5":{"title":"B Min Grade 5","settings":{"minPoints":1425,"onFailSetting":"fail"}},"c-min-grade-1":{"title":"C Min Grade 1","settings":{"minPoints":0,"onFailSetting":"fail"}},"c-min-grade-2":{"title":"C Min Grade 2","settings":{"minPoints":0,"onFailSetting":"fail"}},"c-min-grade-3":{"title":"C Min Grade 3","settings":{"minPoints":0,"onFailSetting":"fail"}},"c-min-grade-4":{"title":"C Min Grade 4","settings":{"minPoints":450,"onFailSetting":"fail"}},"c-min-grade-5":{"title":"C Min Grade 5","settings":{"minPoints":625,"onFailSetting":"fail"}},"convert-to-grade-1":{"title":"Convert To Grade 1","settings":{"numSteps":2,"outputValues":[0,1],"middlePoints":[0]}},"convert-to-grade-2":{"title":"Convert To Grade 2","settings":{"numSteps":2,"outputValues":[0,2],"middlePoints":[0]}},"convert-to-grade-3":{"title":"Convert To Grade 3","settings":{"numSteps":2,"outputValues":[0,3],"middlePoints":[0]}},"convert-to-grade-4":{"title":"Convert To Grade 4","settings":{"numSteps":2,"outputValues":[0,4],"middlePoints":[0]}},"convert-to-grade-5":{"title":"Convert To Grade 5","settings":{"numSteps":2,"outputValues":[0,5],"middlePoints":[0]}},"require-all-3-grade-1":{"title":"Require All 3 Grade 1","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-2":{"title":"Require All 3 Grade 2","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-3":{"title":"Require All 3 Grade 3","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-4":{"title":"Require All 3 Grade 4","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-5":{"title":"Require All 3 Grade 5","settings":{"numFail":0,"onFailSetting":"fail"}}}}'),
(1, null, 'Final grade', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":437,"y":24},"data":{}},{"id":"source-1","type":"source","position":{"x":12,"y":12},"data":{}}],"edges":[{"source":"source-1","sourceHandle":"source-1-source","target":"sink","targetHandle":"sink","id":"reactflow__edge-source-1source-1-source-sinksink"}],"nodeData":{"sink":{"title":"Final grade"},"source-1":{"title":"Exercises 2024","settings":{"minPoints":null,"onFailSetting":"fullfail"}}}}'),
(2, 2, 'Exercises 2024', NOW(), NOW(), '{"nodes":[{"id":"source-12","type":"source","position":{"x":437,"y":629},"data":{}},{"id":"substitute-rounds","type":"substitute","position":{"x":439,"y":809},"data":{}},{"id":"no-fails","type":"require","position":{"x":862,"y":1095},"data":{}},{"id":"substitute-bonus","type":"substitute","position":{"x":862,"y":587},"data":{}},{"id":"sum-bonus","type":"addition","position":{"x":1708,"y":862},"data":{}},{"id":"sum-nobonus","type":"addition","position":{"x":1297,"y":605},"data":{}},{"id":"stepper-bonus","type":"stepper","position":{"x":2012,"y":1041},"data":{}},{"id":"stepper-nobonus","type":"stepper","position":{"x":2012,"y":768},"data":{}},{"id":"max-grade","type":"max","position":{"x":2403,"y":950},"data":{}},{"id":"sink","type":"sink","position":{"x":2705,"y":1024},"data":{}},{"id":"source-4","type":"source","position":{"x":12,"y":732},"data":{}},{"id":"source-5","type":"source","position":{"x":12,"y":912},"data":{}},{"id":"source-6","type":"source","position":{"x":12,"y":1092},"data":{}},{"id":"source-7","type":"source","position":{"x":12,"y":1272},"data":{}},{"id":"source-8","type":"source","position":{"x":12,"y":1452},"data":{}},{"id":"source-9","type":"source","position":{"x":12,"y":1632},"data":{}},{"id":"source-10","type":"source","position":{"x":12,"y":1812},"data":{}},{"id":"source-11","type":"source","position":{"x":12,"y":1992},"data":{}},{"id":"source-13","type":"source","position":{"x":12,"y":12},"data":{}},{"id":"source-14","type":"source","position":{"x":12,"y":192},"data":{}},{"id":"source-15","type":"source","position":{"x":12,"y":372},"data":{}},{"id":"source-16","type":"source","position":{"x":12,"y":552},"data":{}},{"id":"dnd-require-dndnode-0","type":"require","position":{"x":1286,"y":1046},"data":{}}],"edges":[{"id":"sum-bonus:-stepper-bonus:","source":"sum-bonus","target":"stepper-bonus","sourceHandle":"sum-bonus-source","targetHandle":"stepper-bonus"},{"id":"sum-nobonus:-stepper-nobonus:","source":"sum-nobonus","target":"stepper-nobonus","sourceHandle":"sum-nobonus-source","targetHandle":"stepper-nobonus"},{"id":"stepper-nobonus:-max-grade:0","source":"stepper-nobonus","target":"max-grade","sourceHandle":"stepper-nobonus-source","targetHandle":"max-grade-0"},{"id":"stepper-bonus:-max-grade:1","source":"stepper-bonus","target":"max-grade","sourceHandle":"stepper-bonus-source","targetHandle":"max-grade-1"},{"id":"max-grade:-sink:","source":"max-grade","target":"sink","sourceHandle":"max-grade-source","targetHandle":"sink"},{"id":"reactflow__edge-source-13source-13-source-substitute-roundssubstitute-rounds-substitute-19","source":"source-13","target":"substitute-rounds","sourceHandle":"source-13-source","targetHandle":"substitute-rounds-substitute-19"},{"id":"reactflow__edge-source-14source-14-source-substitute-roundssubstitute-rounds-substitute-20","source":"source-14","target":"substitute-rounds","sourceHandle":"source-14-source","targetHandle":"substitute-rounds-substitute-20"},{"id":"reactflow__edge-source-15source-15-source-substitute-roundssubstitute-rounds-substitute-21","source":"source-15","target":"substitute-rounds","sourceHandle":"source-15-source","targetHandle":"substitute-rounds-substitute-21"},{"id":"reactflow__edge-source-16source-16-source-substitute-roundssubstitute-rounds-substitute-22","source":"source-16","target":"substitute-rounds","sourceHandle":"source-16-source","targetHandle":"substitute-rounds-substitute-22"},{"id":"reactflow__edge-source-4source-4-source-substitute-roundssubstitute-rounds-exercise-23","source":"source-4","target":"substitute-rounds","sourceHandle":"source-4-source","targetHandle":"substitute-rounds-exercise-23"},{"id":"reactflow__edge-source-5source-5-source-substitute-roundssubstitute-rounds-exercise-24","source":"source-5","target":"substitute-rounds","sourceHandle":"source-5-source","targetHandle":"substitute-rounds-exercise-24"},{"id":"reactflow__edge-source-6source-6-source-substitute-roundssubstitute-rounds-exercise-25","source":"source-6","target":"substitute-rounds","sourceHandle":"source-6-source","targetHandle":"substitute-rounds-exercise-25"},{"id":"reactflow__edge-source-7source-7-source-substitute-roundssubstitute-rounds-exercise-26","source":"source-7","target":"substitute-rounds","sourceHandle":"source-7-source","targetHandle":"substitute-rounds-exercise-26"},{"id":"reactflow__edge-source-8source-8-source-substitute-roundssubstitute-rounds-exercise-27","source":"source-8","target":"substitute-rounds","sourceHandle":"source-8-source","targetHandle":"substitute-rounds-exercise-27"},{"id":"reactflow__edge-source-9source-9-source-substitute-roundssubstitute-rounds-exercise-28","source":"source-9","target":"substitute-rounds","sourceHandle":"source-9-source","targetHandle":"substitute-rounds-exercise-28"},{"id":"reactflow__edge-source-10source-10-source-substitute-roundssubstitute-rounds-exercise-29","source":"source-10","target":"substitute-rounds","sourceHandle":"source-10-source","targetHandle":"substitute-rounds-exercise-29"},{"id":"reactflow__edge-source-11source-11-source-substitute-roundssubstitute-rounds-exercise-30","source":"source-11","target":"substitute-rounds","sourceHandle":"source-11-source","targetHandle":"substitute-rounds-exercise-30"},{"id":"reactflow__edge-source-12source-12-source-substitute-bonussubstitute-bonus-exercise-19","source":"source-12","target":"substitute-bonus","sourceHandle":"source-12-source","targetHandle":"substitute-bonus-exercise-19"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-19-source-substitute-bonussubstitute-bonus-substitute-20","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-19-source","targetHandle":"substitute-bonus-substitute-20"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-20-source-substitute-bonussubstitute-bonus-substitute-21","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-20-source","targetHandle":"substitute-bonus-substitute-21"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-21-source-substitute-bonussubstitute-bonus-substitute-22","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-21-source","targetHandle":"substitute-bonus-substitute-22"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-22-source-substitute-bonussubstitute-bonus-substitute-23","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-22-source","targetHandle":"substitute-bonus-substitute-23"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-23-source-no-failsno-fails-8","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-23-source","targetHandle":"no-fails-8"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-24-source-no-failsno-fails-9","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-24-source","targetHandle":"no-fails-9"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-25-source-no-failsno-fails-10","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-25-source","targetHandle":"no-fails-10"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-26-source-no-failsno-fails-11","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-26-source","targetHandle":"no-fails-11"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-27-source-no-failsno-fails-12","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-27-source","targetHandle":"no-fails-12"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-28-source-no-failsno-fails-13","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-28-source","targetHandle":"no-fails-13"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-29-source-no-failsno-fails-14","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-29-source","targetHandle":"no-fails-14"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-30-source-no-failsno-fails-15","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-30-source","targetHandle":"no-fails-15"},{"id":"reactflow__edge-no-failsno-fails-8-source-sum-nobonussum-nobonus-8","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-8-source","targetHandle":"sum-nobonus-8"},{"id":"reactflow__edge-no-failsno-fails-9-source-sum-nobonussum-nobonus-9","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-9-source","targetHandle":"sum-nobonus-9"},{"id":"reactflow__edge-no-failsno-fails-10-source-sum-nobonussum-nobonus-10","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-10-source","targetHandle":"sum-nobonus-10"},{"id":"reactflow__edge-no-failsno-fails-11-source-sum-nobonussum-nobonus-11","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-11-source","targetHandle":"sum-nobonus-11"},{"id":"reactflow__edge-no-failsno-fails-12-source-sum-nobonussum-nobonus-12","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-12-source","targetHandle":"sum-nobonus-12"},{"id":"reactflow__edge-no-failsno-fails-13-source-sum-nobonussum-nobonus-13","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-13-source","targetHandle":"sum-nobonus-13"},{"id":"reactflow__edge-no-failsno-fails-14-source-sum-nobonussum-nobonus-14","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-14-source","targetHandle":"sum-nobonus-14"},{"id":"reactflow__edge-no-failsno-fails-15-source-sum-nobonussum-nobonus-15","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-15-source","targetHandle":"sum-nobonus-15"},{"id":"reactflow__edge-substitute-bonussubstitute-bonus-exercise-19-source-dnd-require-dndnode-0dnd-require-dndnode-0-0","source":"substitute-bonus","target":"dnd-require-dndnode-0","sourceHandle":"substitute-bonus-exercise-19-source","targetHandle":"dnd-require-dndnode-0-0"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-0-source-sum-bonussum-bonus-27","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-0-source","targetHandle":"sum-bonus-27"},{"id":"reactflow__edge-no-failsno-fails-8-source-dnd-require-dndnode-0dnd-require-dndnode-0-12","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-8-source","targetHandle":"dnd-require-dndnode-0-12"},{"id":"reactflow__edge-no-failsno-fails-9-source-dnd-require-dndnode-0dnd-require-dndnode-0-13","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-9-source","targetHandle":"dnd-require-dndnode-0-13"},{"id":"reactflow__edge-no-failsno-fails-10-source-dnd-require-dndnode-0dnd-require-dndnode-0-14","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-10-source","targetHandle":"dnd-require-dndnode-0-14"},{"id":"reactflow__edge-no-failsno-fails-11-source-dnd-require-dndnode-0dnd-require-dndnode-0-15","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-11-source","targetHandle":"dnd-require-dndnode-0-15"},{"id":"reactflow__edge-no-failsno-fails-12-source-dnd-require-dndnode-0dnd-require-dndnode-0-16","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-12-source","targetHandle":"dnd-require-dndnode-0-16"},{"id":"reactflow__edge-no-failsno-fails-13-source-dnd-require-dndnode-0dnd-require-dndnode-0-17","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-13-source","targetHandle":"dnd-require-dndnode-0-17"},{"id":"reactflow__edge-no-failsno-fails-14-source-dnd-require-dndnode-0dnd-require-dndnode-0-18","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-14-source","targetHandle":"dnd-require-dndnode-0-18"},{"id":"reactflow__edge-no-failsno-fails-15-source-dnd-require-dndnode-0dnd-require-dndnode-0-19","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-15-source","targetHandle":"dnd-require-dndnode-0-19"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-12-source-sum-bonussum-bonus-37","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-12-source","targetHandle":"sum-bonus-37"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-13-source-sum-bonussum-bonus-38","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-13-source","targetHandle":"sum-bonus-38"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-14-source-sum-bonussum-bonus-39","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-14-source","targetHandle":"sum-bonus-39"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-15-source-sum-bonussum-bonus-40","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-15-source","targetHandle":"sum-bonus-40"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-16-source-sum-bonussum-bonus-41","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-16-source","targetHandle":"sum-bonus-41"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-17-source-sum-bonussum-bonus-42","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-17-source","targetHandle":"sum-bonus-42"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-18-source-sum-bonussum-bonus-43","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-18-source","targetHandle":"sum-bonus-43"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-19-source-sum-bonussum-bonus-44","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-19-source","targetHandle":"sum-bonus-44"}],"nodeData":{"sink":{"title":"Exercises 2024"},"no-fails":{"title":"No round fails","settings":{"numFail":0,"onFailSetting":"fullfail"}},"source-4":{"title":"Round 1","settings":{"minPoints":360,"onFailSetting":"fail"}},"source-5":{"title":"Round 2","settings":{"minPoints":295,"onFailSetting":"fail"}},"source-6":{"title":"Round 3","settings":{"minPoints":325,"onFailSetting":"fail"}},"source-7":{"title":"Round 4","settings":{"minPoints":360,"onFailSetting":"fail"}},"source-8":{"title":"Round 5","settings":{"minPoints":335,"onFailSetting":"fail"}},"source-9":{"title":"Round 6","settings":{"minPoints":400,"onFailSetting":"fail"}},"max-grade":{"title":"Max grade","settings":{"minValue":0}},"source-10":{"title":"Round 7","settings":{"minPoints":370,"onFailSetting":"fail"}},"source-11":{"title":"Round 8","settings":{"minPoints":385,"onFailSetting":"fail"}},"source-12":{"title":"Bonus Round","settings":{"minPoints":600,"onFailSetting":"fail"}},"source-13":{"title":"Substitute 1","settings":{"minPoints":200,"onFailSetting":"fail"}},"source-14":{"title":"Substitute 2","settings":{"minPoints":200,"onFailSetting":"fail"}},"source-15":{"title":"Substitute 3","settings":{"minPoints":200,"onFailSetting":"fail"}},"source-16":{"title":"Substitute 4","settings":{"minPoints":200,"onFailSetting":"fail"}},"sum-bonus":{"title":"Sum bonus"},"minpoints-1":{"title":"Minpoints 1","settings":{"minPoints":360,"onFailSetting":"fullfail"}},"minpoints-2":{"title":"Minpoints 2","settings":{"minPoints":295,"onFailSetting":"fullfail"}},"minpoints-3":{"title":"Minpoints 3","settings":{"minPoints":325,"onFailSetting":"fullfail"}},"minpoints-4":{"title":"Minpoints 4","settings":{"minPoints":360,"onFailSetting":"fullfail"}},"minpoints-5":{"title":"Minpoints 5","settings":{"minPoints":335,"onFailSetting":"fullfail"}},"minpoints-6":{"title":"Minpoints 6","settings":{"minPoints":400,"onFailSetting":"fullfail"}},"minpoints-7":{"title":"Minpoints 7","settings":{"minPoints":370,"onFailSetting":"fullfail"}},"minpoints-8":{"title":"Minpoints 8","settings":{"minPoints":385,"onFailSetting":"fullfail"}},"sum-nobonus":{"title":"Sum nobonus"},"substitute-4":{"title":"Substitute 4"},"bonus-require":{"title":"Bonus require","settings":{"numFail":0,"onFailSetting":"fail"}},"stepper-bonus":{"title":"Stepper bonus","settings":{"numSteps":6,"outputValues":[0,1,2,3,4,5],"middlePoints":[2829,3699,4499,5349,6049]}},"minpoints-bonus":{"title":"Minpoints bonus","settings":{"minPoints":600,"onFailSetting":"fullfail"}},"minpoints-sub-1":{"title":"Minpoints sub 1","settings":{"minPoints":200,"onFailSetting":"fullfail"}},"minpoints-sub-2":{"title":"Minpoints sub 2","settings":{"minPoints":200,"onFailSetting":"fullfail"}},"minpoints-sub-3":{"title":"Minpoints sub 3","settings":{"minPoints":200,"onFailSetting":"fullfail"}},"minpoints-sub-4":{"title":"Minpoints sub 4","settings":{"minPoints":200,"onFailSetting":"fullfail"}},"stepper-nobonus":{"title":"Stepper nobonus","settings":{"numSteps":3,"outputValues":[0,1,2],"middlePoints":[2829,3699]}},"substitute-bonus":{"title":"Substitute bonus","settings":{"maxSubstitutions":1,"substituteValues":[600]}},"substitute-rounds":{"title":"Substitute rounds","settings":{"maxSubstitutions":3,"substituteValues":[360,295,325,360,335,400,370,385]}},"dnd-require-dndnode-0":{"title":"Require substitute pass\n","settings":{"numFail":0,"onFailSetting":"fail"}}}}'),
(2, null, 'Final grade', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":437,"y":24},"data":{}},{"id":"source-2","type":"source","position":{"x":12,"y":12},"data":{}}],"edges":[{"source":"source-2","sourceHandle":"source-2-source","target":"sink","targetHandle":"sink","id":"reactflow__edge-source-2source-2-source-sinksink"}],"nodeData":{"sink":{"title":"Final grade"},"source-2":{"title":"Exercises 2024","settings":{"minPoints":null,"onFailSetting":"fullfail"}}}}'),
(3, 3,'Exercises 2024', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":725,"y":102},"data":{}},{"id":"source-17","type":"source","position":{"x":12,"y":12},"data":{}},{"id":"source-18","type":"source","position":{"x":12,"y":169},"data":{}},{"id":"addition","type":"addition","position":{"x":437,"y":39},"data":{}}],"edges":[{"id":"source-17:-addition:0","source":"source-17","target":"addition","sourceHandle":"source-17-source","targetHandle":"addition-0"},{"id":"source-18:-addition:1","source":"source-18","target":"addition","sourceHandle":"source-18-source","targetHandle":"addition-1"},{"id":"reactflow__edge-additionaddition-source-sinksink","source":"addition","target":"sink","sourceHandle":"addition-source","targetHandle":"sink"}],"nodeData":{"sink":{"title":"Exercises 2024"},"addition":{"title":"Addition"},"source-17":{"title":"Exercise 1","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"source-18":{"title":"Exercise 2","settings":{"minPoints":null,"onFailSetting":"fullfail"}}}}'),
(3, 4,'Exam 2024', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":437,"y":24},"data":{}},{"id":"source-19","type":"source","position":{"x":12,"y":12},"data":{}}],"edges":[{"id":"reactflow__edge-source-19source-19-source-sinksink","source":"source-19","target":"sink","sourceHandle":"source-19-source","targetHandle":"sink"}],"nodeData":{"sink":{"title":"Exam 2024"},"source-19":{"title":"Exam points","settings":{"minPoints":null,"onFailSetting":"fullfail"}}}}'),
(3, null, 'Final grade', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":1491,"y":133},"data":{}},{"id":"source-4","type":"source","position":{"x":12,"y":31},"data":{}},{"id":"source-3","type":"source","position":{"x":12,"y":211},"data":{}},{"id":"average","type":"average","position":{"x":437,"y":50},"data":{}},{"id":"stepper","type":"stepper","position":{"x":1100,"y":12},"data":{}},{"id":"dnd-max-dndnode-0","type":"max","position":{"x":808,"y":57},"data":{}}],"edges":[{"id":"source-4:-average:0","source":"source-4","target":"average","sourceHandle":"source-4-source","targetHandle":"average-0"},{"id":"source-3:-average:1","source":"source-3","target":"average","sourceHandle":"source-3-source","targetHandle":"average-1"},{"id":"stepper:-sink:","source":"stepper","target":"sink","sourceHandle":"stepper-source","targetHandle":"sink"},{"id":"reactflow__edge-source-4source-4-source-dnd-max-dndnode-0dnd-max-dndnode-0-0","source":"source-4","target":"dnd-max-dndnode-0","sourceHandle":"source-4-source","targetHandle":"dnd-max-dndnode-0-0"},{"id":"reactflow__edge-averageaverage-source-dnd-max-dndnode-0dnd-max-dndnode-0-1","source":"average","target":"dnd-max-dndnode-0","sourceHandle":"average-source","targetHandle":"dnd-max-dndnode-0-1"},{"id":"reactflow__edge-dnd-max-dndnode-0dnd-max-dndnode-0-source-stepperstepper","source":"dnd-max-dndnode-0","target":"stepper","sourceHandle":"dnd-max-dndnode-0-source","targetHandle":"stepper"}],"nodeData":{"sink":{"title":"Final grade"},"average":{"title":"Average","settings":{"weights":{"average-0":75,"average-1":25},"percentageMode":true}},"stepper":{"title":"Convert to grade","settings":{"numSteps":6,"outputValues":[1,2,3,4,5],"middlePoints":[12,14,16,18,20]}},"source-3":{"title":"Exercises 2024","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"source-4":{"title":"Exam 2024","settings":{"minPoints":10,"onFailSetting":"fullfail"}},"dnd-max-dndnode-0":{"title":"Max","settings":{"minValue":0}}}}'),
(4, 5,'Exercises 2024', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":725,"y":102},"data":{}},{"id":"source-20","type":"source","position":{"x":12,"y":12},"data":{}},{"id":"source-21","type":"source","position":{"x":12,"y":169},"data":{}},{"id":"addition","type":"addition","position":{"x":437,"y":39},"data":{}}],"edges":[{"id":"source-20:-addition:0","source":"source-20","target":"addition","sourceHandle":"source-20-source","targetHandle":"addition-0"},{"id":"source-21:-addition:1","source":"source-21","target":"addition","sourceHandle":"source-21-source","targetHandle":"addition-1"},{"id":"reactflow__edge-additionaddition-source-sinksink","source":"addition","target":"sink","sourceHandle":"addition-source","targetHandle":"sink"}],"nodeData":{"sink":{"title":"Exercises 2024"},"addition":{"title":"Addition"},"source-20":{"title":"Exercise 1","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"source-21":{"title":"Exercise 2","settings":{"minPoints":null,"onFailSetting":"fullfail"}}}}'),
(4, 6,'Exam 2024', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":437,"y":24},"data":{}},{"id":"source-22","type":"source","position":{"x":12,"y":12},"data":{}}],"edges":[{"id":"reactflow__edge-source-22source-22-source-sinksink","source":"source-22","target":"sink","sourceHandle":"source-22-source","targetHandle":"sink"}],"nodeData":{"sink":{"title":"Exam 2024"},"source-22":{"title":"Exam points","settings":{"minPoints":null,"onFailSetting":"fullfail"}}}}'),
(4, null, 'Final grade', NOW(), NOW(), '{"nodes":[{"id":"sink","type":"sink","position":{"x":1491,"y":133},"data":{}},{"id":"source-5","type":"source","position":{"x":12,"y":31},"data":{}},{"id":"source-6","type":"source","position":{"x":12,"y":211},"data":{}},{"id":"average","type":"average","position":{"x":437,"y":50},"data":{}},{"id":"stepper","type":"stepper","position":{"x":1100,"y":12},"data":{}},{"id":"dnd-max-dndnode-0","type":"max","position":{"x":808,"y":57},"data":{}}],"edges":[{"id":"source-5:-average:0","source":"source-5","target":"average","sourceHandle":"source-5-source","targetHandle":"average-0"},{"id":"source-6:-average:1","source":"source-6","target":"average","sourceHandle":"source-6-source","targetHandle":"average-1"},{"id":"stepper:-sink:","source":"stepper","target":"sink","sourceHandle":"stepper-source","targetHandle":"sink"},{"id":"reactflow__edge-source-5source-5-source-dnd-max-dndnode-0dnd-max-dndnode-0-0","source":"source-5","target":"dnd-max-dndnode-0","sourceHandle":"source-5-source","targetHandle":"dnd-max-dndnode-0-0"},{"id":"reactflow__edge-averageaverage-source-dnd-max-dndnode-0dnd-max-dndnode-0-1","source":"average","target":"dnd-max-dndnode-0","sourceHandle":"average-source","targetHandle":"dnd-max-dndnode-0-1"},{"id":"reactflow__edge-dnd-max-dndnode-0dnd-max-dndnode-0-source-stepperstepper","source":"dnd-max-dndnode-0","target":"stepper","sourceHandle":"dnd-max-dndnode-0-source","targetHandle":"stepper"}],"nodeData":{"sink":{"title":"Final grade"},"average":{"title":"Average","settings":{"weights":{"average-0":75,"average-1":25},"percentageMode":true}},"stepper":{"title":"Convert to grade","settings":{"numSteps":6,"outputValues":[1,2,3,4,5],"middlePoints":[12,14,16,18,20]}},"source-6":{"title":"Exercises 2024","settings":{"minPoints":null,"onFailSetting":"fullfail"}},"source-5":{"title":"Exam 2024","settings":{"minPoints":10,"onFailSetting":"fullfail"}},"dnd-max-dndnode-0":{"title":"Max","settings":{"minValue":0}}}}');