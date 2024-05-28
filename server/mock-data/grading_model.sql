-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.grading_model (course_id, name, created_at, updated_at, graph_structure) VALUES
(1, 'O1 Grading', NOW(), NOW(), '{"nodes":[{"id":"attainment-1","position":{"x":12,"y":1127},"data":{},"type":"attainment"},{"id":"attainment-2","position":{"x":12,"y":1284},"data":{},"type":"attainment"},{"id":"attainment-3","position":{"x":12,"y":1441},"data":{},"type":"attainment"},{"id":"sum-abc","position":{"x":437,"y":971},"data":{},"type":"addition"},{"id":"sum-bc","position":{"x":443,"y":1262},"data":{},"type":"addition"},{"id":"sum-c","position":{"x":445,"y":1523},"data":{},"type":"addition"},{"id":"best-grade","position":{"x":1966,"y":1169},"data":{},"type":"max"},{"id":"final-grade","position":{"x":2273,"y":1295},"data":{},"type":"grade"},{"id":"a-min-grade-1","position":{"x":728,"y":12},"data":{},"type":"minpoints"},{"id":"b-min-grade-1","position":{"x":728,"y":192},"data":{},"type":"minpoints"},{"id":"c-min-grade-1","position":{"x":728,"y":372},"data":{},"type":"minpoints"},{"id":"require-all-3-grade-1","position":{"x":1153,"y":535},"data":{},"type":"require"},{"id":"convert-to-grade-1","position":{"x":1575,"y":765},"data":{},"type":"stepper"},{"id":"a-min-grade-2","position":{"x":728,"y":552},"data":{},"type":"minpoints"},{"id":"b-min-grade-2","position":{"x":728,"y":732},"data":{},"type":"minpoints"},{"id":"c-min-grade-2","position":{"x":728,"y":912},"data":{},"type":"minpoints"},{"id":"require-all-3-grade-2","position":{"x":1153,"y":866},"data":{},"type":"require"},{"id":"convert-to-grade-2","position":{"x":1575,"y":1004},"data":{},"type":"stepper"},{"id":"a-min-grade-3","position":{"x":728,"y":1092},"data":{},"type":"minpoints"},{"id":"b-min-grade-3","position":{"x":728,"y":1272},"data":{},"type":"minpoints"},{"id":"c-min-grade-3","position":{"x":728,"y":1452},"data":{},"type":"minpoints"},{"id":"require-all-3-grade-3","position":{"x":1153,"y":1197},"data":{},"type":"require"},{"id":"convert-to-grade-3","position":{"x":1575,"y":1243},"data":{},"type":"stepper"},{"id":"a-min-grade-4","position":{"x":728,"y":1632},"data":{},"type":"minpoints"},{"id":"b-min-grade-4","position":{"x":728,"y":1812},"data":{},"type":"minpoints"},{"id":"c-min-grade-4","position":{"x":728,"y":1992},"data":{},"type":"minpoints"},{"id":"require-all-3-grade-4","position":{"x":1153,"y":1528},"data":{},"type":"require"},{"id":"convert-to-grade-4","position":{"x":1575,"y":1482},"data":{},"type":"stepper"},{"id":"a-min-grade-5","position":{"x":728,"y":2172},"data":{},"type":"minpoints"},{"id":"b-min-grade-5","position":{"x":728,"y":2352},"data":{},"type":"minpoints"},{"id":"c-min-grade-5","position":{"x":728,"y":2532},"data":{},"type":"minpoints"},{"id":"require-all-3-grade-5","position":{"x":1153,"y":1859},"data":{},"type":"require"},{"id":"convert-to-grade-5","position":{"x":1575,"y":1721},"data":{},"type":"stepper"}],"edges":[{"id":"attainment-1:-sum-abc:0","source":"attainment-1","target":"sum-abc","sourceHandle":"attainment-1-source","targetHandle":"sum-abc-0"},{"id":"attainment-2:-sum-abc:1","source":"attainment-2","target":"sum-abc","sourceHandle":"attainment-2-source","targetHandle":"sum-abc-1"},{"id":"attainment-3:-sum-abc:2","source":"attainment-3","target":"sum-abc","sourceHandle":"attainment-3-source","targetHandle":"sum-abc-2"},{"id":"attainment-2:-sum-bc:0","source":"attainment-2","target":"sum-bc","sourceHandle":"attainment-2-source","targetHandle":"sum-bc-0"},{"id":"attainment-3:-sum-bc:1","source":"attainment-3","target":"sum-bc","sourceHandle":"attainment-3-source","targetHandle":"sum-bc-1"},{"id":"attainment-3:-sum-c:0","source":"attainment-3","target":"sum-c","sourceHandle":"attainment-3-source","targetHandle":"sum-c-0"},{"id":"best-grade:-final-grade:","source":"best-grade","target":"final-grade","sourceHandle":"best-grade-source","targetHandle":"final-grade"},{"id":"sum-abc:-a-min-grade-1:","source":"sum-abc","target":"a-min-grade-1","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-1"},{"id":"sum-bc:-b-min-grade-1:","source":"sum-bc","target":"b-min-grade-1","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-1"},{"id":"sum-c:-c-min-grade-1:","source":"sum-c","target":"c-min-grade-1","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-1"},{"id":"a-min-grade-1:-require-all-3-grade-1:0","source":"a-min-grade-1","target":"require-all-3-grade-1","sourceHandle":"a-min-grade-1-source","targetHandle":"require-all-3-grade-1-0"},{"id":"b-min-grade-1:-require-all-3-grade-1:1","source":"b-min-grade-1","target":"require-all-3-grade-1","sourceHandle":"b-min-grade-1-source","targetHandle":"require-all-3-grade-1-1"},{"id":"c-min-grade-1:-require-all-3-grade-1:2","source":"c-min-grade-1","target":"require-all-3-grade-1","sourceHandle":"c-min-grade-1-source","targetHandle":"require-all-3-grade-1-2"},{"id":"require-all-3-grade-1:0-convert-to-grade-1:","source":"require-all-3-grade-1","target":"convert-to-grade-1","sourceHandle":"require-all-3-grade-1-0-source","targetHandle":"convert-to-grade-1"},{"id":"convert-to-grade-1:-best-grade:0","source":"convert-to-grade-1","target":"best-grade","sourceHandle":"convert-to-grade-1-source","targetHandle":"best-grade-0"},{"id":"sum-abc:-a-min-grade-2:","source":"sum-abc","target":"a-min-grade-2","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-2"},{"id":"sum-bc:-b-min-grade-2:","source":"sum-bc","target":"b-min-grade-2","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-2"},{"id":"sum-c:-c-min-grade-2:","source":"sum-c","target":"c-min-grade-2","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-2"},{"id":"a-min-grade-2:-require-all-3-grade-2:0","source":"a-min-grade-2","target":"require-all-3-grade-2","sourceHandle":"a-min-grade-2-source","targetHandle":"require-all-3-grade-2-0"},{"id":"b-min-grade-2:-require-all-3-grade-2:1","source":"b-min-grade-2","target":"require-all-3-grade-2","sourceHandle":"b-min-grade-2-source","targetHandle":"require-all-3-grade-2-1"},{"id":"c-min-grade-2:-require-all-3-grade-2:2","source":"c-min-grade-2","target":"require-all-3-grade-2","sourceHandle":"c-min-grade-2-source","targetHandle":"require-all-3-grade-2-2"},{"id":"require-all-3-grade-2:0-convert-to-grade-2:","source":"require-all-3-grade-2","target":"convert-to-grade-2","sourceHandle":"require-all-3-grade-2-0-source","targetHandle":"convert-to-grade-2"},{"id":"convert-to-grade-2:-best-grade:1","source":"convert-to-grade-2","target":"best-grade","sourceHandle":"convert-to-grade-2-source","targetHandle":"best-grade-1"},{"id":"sum-abc:-a-min-grade-3:","source":"sum-abc","target":"a-min-grade-3","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-3"},{"id":"sum-bc:-b-min-grade-3:","source":"sum-bc","target":"b-min-grade-3","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-3"},{"id":"sum-c:-c-min-grade-3:","source":"sum-c","target":"c-min-grade-3","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-3"},{"id":"a-min-grade-3:-require-all-3-grade-3:0","source":"a-min-grade-3","target":"require-all-3-grade-3","sourceHandle":"a-min-grade-3-source","targetHandle":"require-all-3-grade-3-0"},{"id":"b-min-grade-3:-require-all-3-grade-3:1","source":"b-min-grade-3","target":"require-all-3-grade-3","sourceHandle":"b-min-grade-3-source","targetHandle":"require-all-3-grade-3-1"},{"id":"c-min-grade-3:-require-all-3-grade-3:2","source":"c-min-grade-3","target":"require-all-3-grade-3","sourceHandle":"c-min-grade-3-source","targetHandle":"require-all-3-grade-3-2"},{"id":"require-all-3-grade-3:0-convert-to-grade-3:","source":"require-all-3-grade-3","target":"convert-to-grade-3","sourceHandle":"require-all-3-grade-3-0-source","targetHandle":"convert-to-grade-3"},{"id":"convert-to-grade-3:-best-grade:2","source":"convert-to-grade-3","target":"best-grade","sourceHandle":"convert-to-grade-3-source","targetHandle":"best-grade-2"},{"id":"sum-abc:-a-min-grade-4:","source":"sum-abc","target":"a-min-grade-4","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-4"},{"id":"sum-bc:-b-min-grade-4:","source":"sum-bc","target":"b-min-grade-4","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-4"},{"id":"sum-c:-c-min-grade-4:","source":"sum-c","target":"c-min-grade-4","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-4"},{"id":"a-min-grade-4:-require-all-3-grade-4:0","source":"a-min-grade-4","target":"require-all-3-grade-4","sourceHandle":"a-min-grade-4-source","targetHandle":"require-all-3-grade-4-0"},{"id":"b-min-grade-4:-require-all-3-grade-4:1","source":"b-min-grade-4","target":"require-all-3-grade-4","sourceHandle":"b-min-grade-4-source","targetHandle":"require-all-3-grade-4-1"},{"id":"c-min-grade-4:-require-all-3-grade-4:2","source":"c-min-grade-4","target":"require-all-3-grade-4","sourceHandle":"c-min-grade-4-source","targetHandle":"require-all-3-grade-4-2"},{"id":"require-all-3-grade-4:0-convert-to-grade-4:","source":"require-all-3-grade-4","target":"convert-to-grade-4","sourceHandle":"require-all-3-grade-4-0-source","targetHandle":"convert-to-grade-4"},{"id":"convert-to-grade-4:-best-grade:3","source":"convert-to-grade-4","target":"best-grade","sourceHandle":"convert-to-grade-4-source","targetHandle":"best-grade-3"},{"id":"sum-abc:-a-min-grade-5:","source":"sum-abc","target":"a-min-grade-5","sourceHandle":"sum-abc-source","targetHandle":"a-min-grade-5"},{"id":"sum-bc:-b-min-grade-5:","source":"sum-bc","target":"b-min-grade-5","sourceHandle":"sum-bc-source","targetHandle":"b-min-grade-5"},{"id":"sum-c:-c-min-grade-5:","source":"sum-c","target":"c-min-grade-5","sourceHandle":"sum-c-source","targetHandle":"c-min-grade-5"},{"id":"a-min-grade-5:-require-all-3-grade-5:0","source":"a-min-grade-5","target":"require-all-3-grade-5","sourceHandle":"a-min-grade-5-source","targetHandle":"require-all-3-grade-5-0"},{"id":"b-min-grade-5:-require-all-3-grade-5:1","source":"b-min-grade-5","target":"require-all-3-grade-5","sourceHandle":"b-min-grade-5-source","targetHandle":"require-all-3-grade-5-1"},{"id":"c-min-grade-5:-require-all-3-grade-5:2","source":"c-min-grade-5","target":"require-all-3-grade-5","sourceHandle":"c-min-grade-5-source","targetHandle":"require-all-3-grade-5-2"},{"id":"require-all-3-grade-5:0-convert-to-grade-5:","source":"require-all-3-grade-5","target":"convert-to-grade-5","sourceHandle":"require-all-3-grade-5-0-source","targetHandle":"convert-to-grade-5"},{"id":"convert-to-grade-5:-best-grade:4","source":"convert-to-grade-5","target":"best-grade","sourceHandle":"convert-to-grade-5-source","targetHandle":"best-grade-4"}],"nodeData":{"sum-c":{"title":"Sum C"},"sum-bc":{"title":"Sum BC"},"sum-abc":{"title":"Sum ABC"},"best-grade":{"title":"Best Grade","settings":{"minValue":0}},"final-grade":{"title":"Final Grade"},"attainment-1":{"title":"Tier A","settings":{"minPoints":0,"onFailSetting":"coursefail"}},"attainment-2":{"title":"Tier B","settings":{"minPoints":0,"onFailSetting":"coursefail"}},"attainment-3":{"title":"Tier C","settings":{"minPoints":0,"onFailSetting":"coursefail"}},"a-min-grade-1":{"title":"A Min Grade 1","settings":{"minPoints":2000,"onFailSetting":"fail"}},"a-min-grade-2":{"title":"A Min Grade 2","settings":{"minPoints":2550,"onFailSetting":"fail"}},"a-min-grade-3":{"title":"A Min Grade 3","settings":{"minPoints":2900,"onFailSetting":"fail"}},"a-min-grade-4":{"title":"A Min Grade 4","settings":{"minPoints":3350,"onFailSetting":"fail"}},"a-min-grade-5":{"title":"A Min Grade 5","settings":{"minPoints":326,"onFailSetting":"fail"}},"b-min-grade-1":{"title":"B Min Grade 1","settings":{"minPoints":0,"onFailSetting":"fail"}},"b-min-grade-2":{"title":"B Min Grade 2","settings":{"minPoints":450,"onFailSetting":"fail"}},"b-min-grade-3":{"title":"B Min Grade 3","settings":{"minPoints":800,"onFailSetting":"fail"}},"b-min-grade-4":{"title":"B Min Grade 4","settings":{"minPoints":1250,"onFailSetting":"fail"}},"b-min-grade-5":{"title":"B Min Grade 5","settings":{"minPoints":1425,"onFailSetting":"fail"}},"c-min-grade-1":{"title":"C Min Grade 1","settings":{"minPoints":0,"onFailSetting":"fail"}},"c-min-grade-2":{"title":"C Min Grade 2","settings":{"minPoints":0,"onFailSetting":"fail"}},"c-min-grade-3":{"title":"C Min Grade 3","settings":{"minPoints":0,"onFailSetting":"fail"}},"c-min-grade-4":{"title":"C Min Grade 4","settings":{"minPoints":450,"onFailSetting":"fail"}},"c-min-grade-5":{"title":"C Min Grade 5","settings":{"minPoints":625,"onFailSetting":"fail"}},"convert-to-grade-1":{"title":"Convert To Grade 1","settings":{"numSteps":2,"outputValues":[0,1],"middlePoints":[0]}},"convert-to-grade-2":{"title":"Convert To Grade 2","settings":{"numSteps":2,"outputValues":[0,2],"middlePoints":[0]}},"convert-to-grade-3":{"title":"Convert To Grade 3","settings":{"numSteps":2,"outputValues":[0,3],"middlePoints":[0]}},"convert-to-grade-4":{"title":"Convert To Grade 4","settings":{"numSteps":2,"outputValues":[0,4],"middlePoints":[0]}},"convert-to-grade-5":{"title":"Convert To Grade 5","settings":{"numSteps":2,"outputValues":[0,5],"middlePoints":[0]}},"require-all-3-grade-1":{"title":"Require All 3 Grade 1","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-2":{"title":"Require All 3 Grade 2","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-3":{"title":"Require All 3 Grade 3","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-4":{"title":"Require All 3 Grade 4","settings":{"numFail":0,"onFailSetting":"fail"}},"require-all-3-grade-5":{"title":"Require All 3 Grade 5","settings":{"numFail":0,"onFailSetting":"fail"}}}}'),
(2, 'Y1 Grading', NOW(), NOW(), '{"nodes":[{"id":"attainment-12","position":{"x":437,"y":629},"data":{},"type":"attainment"},{"id":"substitute-rounds","position":{"x":439,"y":809},"data":{},"type":"substitute"},{"id":"no-fails","position":{"x":862,"y":1095},"data":{},"type":"require"},{"id":"substitute-bonus","position":{"x":862,"y":587},"data":{},"type":"substitute"},{"id":"sum-bonus","position":{"x":1708,"y":862},"data":{},"type":"addition"},{"id":"sum-nobonus","position":{"x":1297,"y":605},"data":{},"type":"addition"},{"id":"stepper-bonus","position":{"x":2012,"y":1041},"data":{},"type":"stepper"},{"id":"stepper-nobonus","position":{"x":2012,"y":768},"data":{},"type":"stepper"},{"id":"max-grade","position":{"x":2403,"y":950},"data":{},"type":"max"},{"id":"final-grade","position":{"x":2705,"y":1025},"data":{},"type":"grade"},{"id":"attainment-4","position":{"x":12,"y":732},"data":{},"type":"attainment"},{"id":"attainment-5","position":{"x":12,"y":912},"data":{},"type":"attainment"},{"id":"attainment-6","position":{"x":12,"y":1092},"data":{},"type":"attainment"},{"id":"attainment-7","position":{"x":12,"y":1272},"data":{},"type":"attainment"},{"id":"attainment-8","position":{"x":12,"y":1452},"data":{},"type":"attainment"},{"id":"attainment-9","position":{"x":12,"y":1632},"data":{},"type":"attainment"},{"id":"attainment-10","position":{"x":12,"y":1812},"data":{},"type":"attainment"},{"id":"attainment-11","position":{"x":12,"y":1992},"data":{},"type":"attainment"},{"id":"attainment-13","position":{"x":12,"y":12},"data":{},"type":"attainment"},{"id":"attainment-14","position":{"x":12,"y":192},"data":{},"type":"attainment"},{"id":"attainment-15","position":{"x":12,"y":372},"data":{},"type":"attainment"},{"id":"attainment-16","position":{"x":12,"y":552},"data":{},"type":"attainment"},{"id":"dnd-require-dndnode-0","position":{"x":1286,"y":1046},"data":{},"type":"require"}],"edges":[{"id":"sum-bonus:-stepper-bonus:","source":"sum-bonus","target":"stepper-bonus","sourceHandle":"sum-bonus-source","targetHandle":"stepper-bonus"},{"id":"sum-nobonus:-stepper-nobonus:","source":"sum-nobonus","target":"stepper-nobonus","sourceHandle":"sum-nobonus-source","targetHandle":"stepper-nobonus"},{"id":"stepper-nobonus:-max-grade:0","source":"stepper-nobonus","target":"max-grade","sourceHandle":"stepper-nobonus-source","targetHandle":"max-grade-0"},{"id":"stepper-bonus:-max-grade:1","source":"stepper-bonus","target":"max-grade","sourceHandle":"stepper-bonus-source","targetHandle":"max-grade-1"},{"id":"max-grade:-final-grade:","source":"max-grade","target":"final-grade","sourceHandle":"max-grade-source","targetHandle":"final-grade"},{"id":"reactflow__edge-attainment-13attainment-13-source-substitute-roundssubstitute-rounds-substitute-19","source":"attainment-13","target":"substitute-rounds","sourceHandle":"attainment-13-source","targetHandle":"substitute-rounds-substitute-19"},{"id":"reactflow__edge-attainment-14attainment-14-source-substitute-roundssubstitute-rounds-substitute-20","source":"attainment-14","target":"substitute-rounds","sourceHandle":"attainment-14-source","targetHandle":"substitute-rounds-substitute-20"},{"id":"reactflow__edge-attainment-15attainment-15-source-substitute-roundssubstitute-rounds-substitute-21","source":"attainment-15","target":"substitute-rounds","sourceHandle":"attainment-15-source","targetHandle":"substitute-rounds-substitute-21"},{"id":"reactflow__edge-attainment-16attainment-16-source-substitute-roundssubstitute-rounds-substitute-22","source":"attainment-16","target":"substitute-rounds","sourceHandle":"attainment-16-source","targetHandle":"substitute-rounds-substitute-22"},{"id":"reactflow__edge-attainment-4attainment-4-source-substitute-roundssubstitute-rounds-exercise-23","source":"attainment-4","target":"substitute-rounds","sourceHandle":"attainment-4-source","targetHandle":"substitute-rounds-exercise-23"},{"id":"reactflow__edge-attainment-5attainment-5-source-substitute-roundssubstitute-rounds-exercise-24","source":"attainment-5","target":"substitute-rounds","sourceHandle":"attainment-5-source","targetHandle":"substitute-rounds-exercise-24"},{"id":"reactflow__edge-attainment-6attainment-6-source-substitute-roundssubstitute-rounds-exercise-25","source":"attainment-6","target":"substitute-rounds","sourceHandle":"attainment-6-source","targetHandle":"substitute-rounds-exercise-25"},{"id":"reactflow__edge-attainment-7attainment-7-source-substitute-roundssubstitute-rounds-exercise-26","source":"attainment-7","target":"substitute-rounds","sourceHandle":"attainment-7-source","targetHandle":"substitute-rounds-exercise-26"},{"id":"reactflow__edge-attainment-8attainment-8-source-substitute-roundssubstitute-rounds-exercise-27","source":"attainment-8","target":"substitute-rounds","sourceHandle":"attainment-8-source","targetHandle":"substitute-rounds-exercise-27"},{"id":"reactflow__edge-attainment-9attainment-9-source-substitute-roundssubstitute-rounds-exercise-28","source":"attainment-9","target":"substitute-rounds","sourceHandle":"attainment-9-source","targetHandle":"substitute-rounds-exercise-28"},{"id":"reactflow__edge-attainment-10attainment-10-source-substitute-roundssubstitute-rounds-exercise-29","source":"attainment-10","target":"substitute-rounds","sourceHandle":"attainment-10-source","targetHandle":"substitute-rounds-exercise-29"},{"id":"reactflow__edge-attainment-11attainment-11-source-substitute-roundssubstitute-rounds-exercise-30","source":"attainment-11","target":"substitute-rounds","sourceHandle":"attainment-11-source","targetHandle":"substitute-rounds-exercise-30"},{"id":"reactflow__edge-attainment-12attainment-12-source-substitute-bonussubstitute-bonus-exercise-19","source":"attainment-12","target":"substitute-bonus","sourceHandle":"attainment-12-source","targetHandle":"substitute-bonus-exercise-19"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-19-source-substitute-bonussubstitute-bonus-substitute-20","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-19-source","targetHandle":"substitute-bonus-substitute-20"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-20-source-substitute-bonussubstitute-bonus-substitute-21","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-20-source","targetHandle":"substitute-bonus-substitute-21"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-21-source-substitute-bonussubstitute-bonus-substitute-22","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-21-source","targetHandle":"substitute-bonus-substitute-22"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-substitute-22-source-substitute-bonussubstitute-bonus-substitute-23","source":"substitute-rounds","target":"substitute-bonus","sourceHandle":"substitute-rounds-substitute-22-source","targetHandle":"substitute-bonus-substitute-23"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-23-source-no-failsno-fails-8","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-23-source","targetHandle":"no-fails-8"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-24-source-no-failsno-fails-9","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-24-source","targetHandle":"no-fails-9"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-25-source-no-failsno-fails-10","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-25-source","targetHandle":"no-fails-10"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-26-source-no-failsno-fails-11","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-26-source","targetHandle":"no-fails-11"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-27-source-no-failsno-fails-12","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-27-source","targetHandle":"no-fails-12"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-28-source-no-failsno-fails-13","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-28-source","targetHandle":"no-fails-13"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-29-source-no-failsno-fails-14","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-29-source","targetHandle":"no-fails-14"},{"id":"reactflow__edge-substitute-roundssubstitute-rounds-exercise-30-source-no-failsno-fails-15","source":"substitute-rounds","target":"no-fails","sourceHandle":"substitute-rounds-exercise-30-source","targetHandle":"no-fails-15"},{"id":"reactflow__edge-no-failsno-fails-8-source-sum-nobonussum-nobonus-8","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-8-source","targetHandle":"sum-nobonus-8"},{"id":"reactflow__edge-no-failsno-fails-9-source-sum-nobonussum-nobonus-9","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-9-source","targetHandle":"sum-nobonus-9"},{"id":"reactflow__edge-no-failsno-fails-10-source-sum-nobonussum-nobonus-10","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-10-source","targetHandle":"sum-nobonus-10"},{"id":"reactflow__edge-no-failsno-fails-11-source-sum-nobonussum-nobonus-11","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-11-source","targetHandle":"sum-nobonus-11"},{"id":"reactflow__edge-no-failsno-fails-12-source-sum-nobonussum-nobonus-12","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-12-source","targetHandle":"sum-nobonus-12"},{"id":"reactflow__edge-no-failsno-fails-13-source-sum-nobonussum-nobonus-13","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-13-source","targetHandle":"sum-nobonus-13"},{"id":"reactflow__edge-no-failsno-fails-14-source-sum-nobonussum-nobonus-14","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-14-source","targetHandle":"sum-nobonus-14"},{"id":"reactflow__edge-no-failsno-fails-15-source-sum-nobonussum-nobonus-15","source":"no-fails","target":"sum-nobonus","sourceHandle":"no-fails-15-source","targetHandle":"sum-nobonus-15"},{"id":"reactflow__edge-substitute-bonussubstitute-bonus-exercise-19-source-dnd-require-dndnode-0dnd-require-dndnode-0-0","source":"substitute-bonus","target":"dnd-require-dndnode-0","sourceHandle":"substitute-bonus-exercise-19-source","targetHandle":"dnd-require-dndnode-0-0"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-0-source-sum-bonussum-bonus-27","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-0-source","targetHandle":"sum-bonus-27"},{"id":"reactflow__edge-no-failsno-fails-8-source-dnd-require-dndnode-0dnd-require-dndnode-0-12","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-8-source","targetHandle":"dnd-require-dndnode-0-12"},{"id":"reactflow__edge-no-failsno-fails-9-source-dnd-require-dndnode-0dnd-require-dndnode-0-13","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-9-source","targetHandle":"dnd-require-dndnode-0-13"},{"id":"reactflow__edge-no-failsno-fails-10-source-dnd-require-dndnode-0dnd-require-dndnode-0-14","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-10-source","targetHandle":"dnd-require-dndnode-0-14"},{"id":"reactflow__edge-no-failsno-fails-11-source-dnd-require-dndnode-0dnd-require-dndnode-0-15","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-11-source","targetHandle":"dnd-require-dndnode-0-15"},{"id":"reactflow__edge-no-failsno-fails-12-source-dnd-require-dndnode-0dnd-require-dndnode-0-16","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-12-source","targetHandle":"dnd-require-dndnode-0-16"},{"id":"reactflow__edge-no-failsno-fails-13-source-dnd-require-dndnode-0dnd-require-dndnode-0-17","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-13-source","targetHandle":"dnd-require-dndnode-0-17"},{"id":"reactflow__edge-no-failsno-fails-14-source-dnd-require-dndnode-0dnd-require-dndnode-0-18","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-14-source","targetHandle":"dnd-require-dndnode-0-18"},{"id":"reactflow__edge-no-failsno-fails-15-source-dnd-require-dndnode-0dnd-require-dndnode-0-19","source":"no-fails","target":"dnd-require-dndnode-0","sourceHandle":"no-fails-15-source","targetHandle":"dnd-require-dndnode-0-19"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-12-source-sum-bonussum-bonus-37","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-12-source","targetHandle":"sum-bonus-37"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-13-source-sum-bonussum-bonus-38","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-13-source","targetHandle":"sum-bonus-38"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-14-source-sum-bonussum-bonus-39","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-14-source","targetHandle":"sum-bonus-39"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-15-source-sum-bonussum-bonus-40","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-15-source","targetHandle":"sum-bonus-40"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-16-source-sum-bonussum-bonus-41","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-16-source","targetHandle":"sum-bonus-41"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-17-source-sum-bonussum-bonus-42","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-17-source","targetHandle":"sum-bonus-42"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-18-source-sum-bonussum-bonus-43","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-18-source","targetHandle":"sum-bonus-43"},{"id":"reactflow__edge-dnd-require-dndnode-0dnd-require-dndnode-0-19-source-sum-bonussum-bonus-44","source":"dnd-require-dndnode-0","target":"sum-bonus","sourceHandle":"dnd-require-dndnode-0-19-source","targetHandle":"sum-bonus-44"}],"nodeData":{"no-fails":{"title":"No round fails","settings":{"numFail":0,"onFailSetting":"coursefail"}},"max-grade":{"title":"Max grade","settings":{"minValue":0}},"sum-bonus":{"title":"Sum bonus"},"final-grade":{"title":"Final grade"},"minpoints-1":{"title":"Minpoints 1","settings":{"minPoints":360,"onFailSetting":"coursefail"}},"minpoints-2":{"title":"Minpoints 2","settings":{"minPoints":295,"onFailSetting":"coursefail"}},"minpoints-3":{"title":"Minpoints 3","settings":{"minPoints":325,"onFailSetting":"coursefail"}},"minpoints-4":{"title":"Minpoints 4","settings":{"minPoints":360,"onFailSetting":"coursefail"}},"minpoints-5":{"title":"Minpoints 5","settings":{"minPoints":335,"onFailSetting":"coursefail"}},"minpoints-6":{"title":"Minpoints 6","settings":{"minPoints":400,"onFailSetting":"coursefail"}},"minpoints-7":{"title":"Minpoints 7","settings":{"minPoints":370,"onFailSetting":"coursefail"}},"minpoints-8":{"title":"Minpoints 8","settings":{"minPoints":385,"onFailSetting":"coursefail"}},"sum-nobonus":{"title":"Sum nobonus"},"attainment-4":{"title":"Round 1","settings":{"minPoints":360,"onFailSetting":"fail"}},"attainment-5":{"title":"Round 2","settings":{"minPoints":295,"onFailSetting":"fail"}},"attainment-6":{"title":"Round 3","settings":{"minPoints":325,"onFailSetting":"fail"}},"attainment-7":{"title":"Round 4","settings":{"minPoints":360,"onFailSetting":"fail"}},"attainment-8":{"title":"Round 5","settings":{"minPoints":335,"onFailSetting":"fail"}},"attainment-9":{"title":"Round 6","settings":{"minPoints":400,"onFailSetting":"fail"}},"substitute-4":{"title":"Substitute 4"},"attainment-10":{"title":"Round 7","settings":{"minPoints":370,"onFailSetting":"fail"}},"attainment-11":{"title":"Round 8","settings":{"minPoints":385,"onFailSetting":"fail"}},"attainment-12":{"title":"Bonus Round","settings":{"minPoints":600,"onFailSetting":"fail"}},"attainment-13":{"title":"Substitute 1","settings":{"minPoints":200,"onFailSetting":"fail"}},"attainment-14":{"title":"Substitute 2","settings":{"minPoints":200,"onFailSetting":"fail"}},"attainment-15":{"title":"Substitute 3","settings":{"minPoints":200,"onFailSetting":"fail"}},"attainment-16":{"title":"Substitute 4","settings":{"minPoints":200,"onFailSetting":"fail"}},"bonus-require":{"title":"Bonus require","settings":{"numFail":0,"onFailSetting":"fail"}},"stepper-bonus":{"title":"Stepper bonus","settings":{"numSteps":6,"outputValues":[0,1,2,3,4,5],"middlePoints":[2829,3699,4499,5349,6049]}},"minpoints-bonus":{"title":"Minpoints bonus","settings":{"minPoints":600,"onFailSetting":"coursefail"}},"minpoints-sub-1":{"title":"Minpoints sub 1","settings":{"minPoints":200,"onFailSetting":"coursefail"}},"minpoints-sub-2":{"title":"Minpoints sub 2","settings":{"minPoints":200,"onFailSetting":"coursefail"}},"minpoints-sub-3":{"title":"Minpoints sub 3","settings":{"minPoints":200,"onFailSetting":"coursefail"}},"minpoints-sub-4":{"title":"Minpoints sub 4","settings":{"minPoints":200,"onFailSetting":"coursefail"}},"stepper-nobonus":{"title":"Stepper nobonus","settings":{"numSteps":3,"outputValues":[0,1,2],"middlePoints":[2829,3699]}},"substitute-bonus":{"title":"Substitute bonus","settings":{"maxSubstitutions":1,"substituteValues":[600]}},"substitute-rounds":{"title":"Substitute rounds","settings":{"maxSubstitutions":3,"substituteValues":[360,295,325,360,335,400,370,385]}},"dnd-require-dndnode-0":{"title":"Require substitute pass\n","settings":{"numFail":0,"onFailSetting":"fail"}}}}'),
(3, 'Average', NOW(), NOW(), '{"nodes":[{"id":"final-grade","position":{"x":1201,"y":218},"data":{},"type":"grade"},{"id":"attainment-17","position":{"x":12,"y":12},"data":{},"type":"attainment"},{"id":"attainment-18","position":{"x":12,"y":194},"data":{},"type":"attainment"},{"id":"attainment-19","position":{"x":12,"y":376},"data":{},"type":"attainment"},{"id":"dnd-average-dndnode-0","position":{"x":439,"y":113},"data":{},"type":"average"},{"id":"dnd-stepper-dndnode-1","position":{"x":810,"y":98},"data":{},"type":"stepper"}],"edges":[{"id":"reactflow__edge-attainment-17attainment-17-source-dnd-average-dndnode-0dnd-average-dndnode-0-0","source":"attainment-17","target":"dnd-average-dndnode-0","sourceHandle":"attainment-17-source","targetHandle":"dnd-average-dndnode-0-0"},{"id":"reactflow__edge-attainment-18attainment-18-source-dnd-average-dndnode-0dnd-average-dndnode-0-1","source":"attainment-18","target":"dnd-average-dndnode-0","sourceHandle":"attainment-18-source","targetHandle":"dnd-average-dndnode-0-1"},{"id":"reactflow__edge-attainment-19attainment-19-source-dnd-average-dndnode-0dnd-average-dndnode-0-2","source":"attainment-19","target":"dnd-average-dndnode-0","sourceHandle":"attainment-19-source","targetHandle":"dnd-average-dndnode-0-2"},{"id":"reactflow__edge-dnd-average-dndnode-0dnd-average-dndnode-0-source-dnd-stepper-dndnode-1dnd-stepper-dndnode-1","source":"dnd-average-dndnode-0","target":"dnd-stepper-dndnode-1","sourceHandle":"dnd-average-dndnode-0-source","targetHandle":"dnd-stepper-dndnode-1"},{"id":"reactflow__edge-dnd-stepper-dndnode-1dnd-stepper-dndnode-1-source-final-gradefinal-grade","source":"dnd-stepper-dndnode-1","target":"final-grade","sourceHandle":"dnd-stepper-dndnode-1-source","targetHandle":"final-grade"}],"nodeData":{"final-grade":{"title":"Final Grade"},"attainment-17":{"title":"Exercise 1","settings":{"minPoints":1,"onFailSetting":"coursefail"}},"attainment-18":{"title":"Exercise 2","settings":{"minPoints":1,"onFailSetting":"coursefail"}},"attainment-19":{"title":"Exam","settings":{"minPoints":2,"onFailSetting":"coursefail"}},"dnd-average-dndnode-0":{"title":"Average","settings":{"weights":{"dnd-average-dndnode-0-0":20,"dnd-average-dndnode-0-1":20,"dnd-average-dndnode-0-2":60},"percentageMode":true}},"dnd-stepper-dndnode-1":{"title":"Stepper","settings":{"numSteps":6,"outputValues":[0,1,2,3,4,5],"middlePoints":[1.6,3.3,5,6.6,8.3]}}}}'),
(4, 'Addition', NOW(), NOW(), '{"nodes":[{"id":"final-grade","position":{"x":1118,"y":218},"data":{},"type":"grade"},{"id":"attainment-20","position":{"x":12,"y":12},"data":{},"type":"attainment"},{"id":"attainment-21","position":{"x":12,"y":194},"data":{},"type":"attainment"},{"id":"attainment-22","position":{"x":12,"y":376},"data":{},"type":"attainment"},{"id":"dnd-addition-dndnode-0","position":{"x":439,"y":140},"data":{},"type":"addition"},{"id":"dnd-stepper-dndnode-1","position":{"x":727,"y":98},"data":{},"type":"stepper"}],"edges":[{"id":"reactflow__edge-attainment-20attainment-20-source-dnd-addition-dndnode-0dnd-addition-dndnode-0-0","source":"attainment-20","target":"dnd-addition-dndnode-0","sourceHandle":"attainment-20-source","targetHandle":"dnd-addition-dndnode-0-0"},{"id":"reactflow__edge-attainment-21attainment-21-source-dnd-addition-dndnode-0dnd-addition-dndnode-0-1","source":"attainment-21","target":"dnd-addition-dndnode-0","sourceHandle":"attainment-21-source","targetHandle":"dnd-addition-dndnode-0-1"},{"id":"reactflow__edge-attainment-22attainment-22-source-dnd-addition-dndnode-0dnd-addition-dndnode-0-2","source":"attainment-22","target":"dnd-addition-dndnode-0","sourceHandle":"attainment-22-source","targetHandle":"dnd-addition-dndnode-0-2"},{"id":"reactflow__edge-dnd-addition-dndnode-0dnd-addition-dndnode-0-source-dnd-stepper-dndnode-1dnd-stepper-dndnode-1","source":"dnd-addition-dndnode-0","target":"dnd-stepper-dndnode-1","sourceHandle":"dnd-addition-dndnode-0-source","targetHandle":"dnd-stepper-dndnode-1"},{"id":"reactflow__edge-dnd-stepper-dndnode-1dnd-stepper-dndnode-1-source-final-gradefinal-grade","source":"dnd-stepper-dndnode-1","target":"final-grade","sourceHandle":"dnd-stepper-dndnode-1-source","targetHandle":"final-grade"}],"nodeData":{"final-grade":{"title":"Final Grade"},"attainment-20":{"title":"Round 1","settings":{"minPoints":1,"onFailSetting":"coursefail"}},"attainment-21":{"title":"Round 2","settings":{"minPoints":1,"onFailSetting":"coursefail"}},"attainment-22":{"title":"Round 3","settings":{"minPoints":1,"onFailSetting":"coursefail"}},"dnd-stepper-dndnode-1":{"title":"Stepper","settings":{"numSteps":6,"outputValues":[0,1,2,3,4,5],"middlePoints":[5,10,15,20,25]}},"dnd-addition-dndnode-0":{"title":"Addition"}}}');