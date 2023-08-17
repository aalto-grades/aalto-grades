-- SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
--
-- SPDX-License-Identifier: MIT

INSERT INTO public.attainment (assessment_model_id, parent_id, name, days_valid, min_required_grade, max_grade, created_at, updated_at, formula, formula_params) VALUES
(1, null, 'name1', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name5", { "weight": 2 }], ["name9", { "weight": 2 }], ["name16", { "weight": 2 }], ["name17", { "weight": 2 }], ["name18", { "weight": 2 }]] }'),
(2, null, 'name2', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name6", { "weight": 2 }], ["name10", { "weight": 2 }]] }'),
(3, null, 'name3', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name7", { "weight": 2 }], ["name11", { "weight": 2 }], ["264", { "weight": 0 }]] }'),
(5, null, 'name4', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name8", { "weight": 2 }], ["name12", { "weight": 2 }]] }'),
(1, 1, 'name5', 365, 1, 100, NOW(), NOW(), 'MANUAL', '{}'),
(2, 2, 'name6', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(3, 3, 'name7', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(5, 4, 'name8', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(1, 1, 'name9', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(2, 2, 'name10', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(3, 3, 'name11', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(5, 4, 'name12', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(8, null, 'name13', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name14", { "weight": 2 }], ["name15", { "weight": 1 }]] }'),
(8, 13, 'name14', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(8, 13, 'name15', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(1, 1, 'name16', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(1, 1, 'name17', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(1, 1, 'name18', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- The following list of weights would be stupidly long and it's not necessary,
-- so it's better left empty
(9, null, 'name19', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [] }'),
(9, 19, 'name20', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name21', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name22', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name23', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name24', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name25', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name26', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name27', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name28', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name29', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name30', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name31', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name32', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name33', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name34', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name35', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name36', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name37', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name38', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name39', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name40', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name41', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name42', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name43', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name44', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name45', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name46', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name47', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name48', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name49', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name50', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name51', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name52', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name53', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name54', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name55', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name56', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name57', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name58', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name59', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name60', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name61', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name62', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name63', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name64', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name65', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name66', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name67', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name68', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name69', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name70', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name71', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name72', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name73', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name74', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name75', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name76', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name77', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name78', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name79', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name80', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name81', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name82', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name83', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name84', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name85', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name86', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name87', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name88', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name89', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name90', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name91', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name92', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name93', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name94', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name95', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name96', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name97', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name98', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name99', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name100', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name101', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name102', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name103', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name104', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name105', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name106', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name107', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name108', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name109', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name110', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name111', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name112', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name113', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name114', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name115', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name116', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name117', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name118', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name119', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name120', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name121', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name122', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name123', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name124', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name125', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name126', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name127', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name128', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name129', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name130', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name131', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name132', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name133', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name134', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name135', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name136', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name137', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name138', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name139', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name140', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name141', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name142', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name143', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name144', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name145', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name146', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name147', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name148', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name149', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name150', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name151', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name152', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name153', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name154', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name155', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name156', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name157', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name158', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name159', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name160', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name161', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name162', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name163', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name164', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name165', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name166', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name167', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name168', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name169', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name170', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name171', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name172', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name173', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name174', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name175', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name176', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name177', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name178', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name179', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name180', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name181', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name182', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name183', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name184', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name185', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name186', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name187', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name188', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name189', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name190', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name191', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name192', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name193', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name194', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name195', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(9, 19, 'name196', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(7, null, 'name197', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name198", { "weight": 0.4 }], ["name199", { "weight": 0.6 }]] }'),
(7, 197, 'name198', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(7, 197, 'name199', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name200", { "weight": 0.1 }], ["name201", { "weight": 0.1 }], ["name202", { "weight": 0.8 }]] }'),
(7, 199, 'name200', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(7, 199, 'name201', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(7, 199, 'name202', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name203", { "weight": 0.5 }], ["name204", { "weight": 0.5 }]] }'),
(7, 202, 'name203', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(7, 202, 'name204', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(4, null, 'name205', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name206", { "weight": 0.5 }], ["name207", { "weight": 0.5 }]] }'),
(4, 205, 'name206', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(4, 205, 'name207', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [] }'),
(6, null, 'name208', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name209", { "weight": 0.75 }], ["name210", { "weight": 0.25 }]] }'),
(6, 208, 'name209', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(6, 208, 'name210', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(10, null, 'name211', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name212", { "weight": 0.75 }], ["name213", { "weight": 0.25 }]] }'),
(10, 211, 'name212', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(10, 211, 'name213', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(2, 6, 'name214', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(2, 214, 'name215', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test CSV template
(15, null, 'name216', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(15, 216, 'name217', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(15, 216, 'name218', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(15, 217, 'name219', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(15, 218, 'name220', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test CSV template without students
(22, null, 'name221', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(22, 221, 'name222', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(22, 221, 'name223', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test CSV upload manual
(14, null, 'name224', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test CSV upload grader
(14, null, 'name225', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test final grades
(24, null, 'name226', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name227", { "weight": 0.25 }]] }'),
(24, 226, 'name227', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test calculating one correct grade and failing grade
(25, null, 'name228', 365, 1, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name229", { "weight": 0.75 }], ["name230", { "weight": 0.25 }]] }'),
(25, 228, 'name229', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(25, 228, 'name230', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test calculating multiple correct grades
(26, null, 'name231', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name232", { "weight": 0.75 }], ["name233", { "weight": 0.25 }]] }'),
(26, 231, 'name232', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(26, 231, 'name233', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test grade calculation at a higher depth
(27, null, 'name234', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name235", { "weight": 0.4 }], ["name236", { "weight": 0.6 }]] }'),
(27, 234, 'name235', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(27, 234, 'name236', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name237", { "weight": 0.1 }], ["name238", { "weight": 0.1 }], ["name239", { "weight": 0.8 }]] }'),
(27, 236, 'name237', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(27, 236, 'name238', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(27, 236, 'name239', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name240", { "weight": 0.5 }], ["name241", { "weight": 0.5 }]] }'),
(27, 239, 'name240', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(27, 239, 'name241', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test overriding grade calculation
(28, null, 'name242', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["name243", { "weight": 0.5 }], ["name244", { "weight": 0.5 }]] }'),
(28, 242, 'name243', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(28, 242, 'name244', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Demo data
(29, null, 'Grade', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["Exercises", { "weight": 0.4 }], ["Project", { "weight": 0.2 }], ["Exam", { "weight": 0.4 }]] }'),
(29, 245, 'Exercises', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(29, 245, 'Project', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(29, 245, 'Exam', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(30, null, 'Grade', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["Project", { "weight": 0.6 }], ["Exam", { "weight": 0.4 }]] }'),
(30, 249, 'Project', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(30, 249, 'Exam', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test multiple roots
(34, null, 'root 252', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(34, null, 'root 253', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Grading test
(41, null, 'assesment model 41, root id 254', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["exam", { "weight": 1.0 }]] }'),
(41, 254, 'exam', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(42, null, 'assesment model 42, root id 256', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["exam", { "weight": 1.0 }]] }'),
(42, 256, 'exam', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test updating name in parent attainment params
(43, null, '258', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["259", { "weight": 1 }], ["260", { "weight": 1 }]] }'),
(43, 258, '259', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(43, 258, '260', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test removing name from parent attainment params
(44, null, '261', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["262", { "weight": 1 }], ["263", { "weight": 1 }]] }'),
(44, 261, '262', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(44, 261, '263', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["267", { "weight": 1 }]] }'),
-- Test updating children array in attainment formula params
(3, 3, '264', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["265", { "weight": 1 }], ["266", { "weight": 1 }]] }'),
(3, 264, '265', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(3, 264, '266', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test removing name from parent attainment formula params
(3, 263, '267', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test uploading multiple grades to the same attainment for a student
(14, null, '268', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test calculating with multiple grades for the same attainment
(45, null, '269', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["270", { "weight": 0.5 }], ["271", { "weight": 0.5 }]] }'),
(45, 269, '270', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(45, 269, '271', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test getting differing numbers of grades
(46, null, '272', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(47, null, '273', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(48, null, '274', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test calculating new grades for a student
(49, null, '275', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["276", { "weight": 0.4 }], ["277", { "weight": 0.6 }]] }'),
(49, 275, '276', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(49, 275, '277', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["278", { "weight": 0.1 }], ["279", { "weight": 0.1 }], ["280", { "weight": 0.8 }]] }'),
(49, 277, '278', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(49, 277, '279', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(49, 277, '280', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["281", { "weight": 0.5 }], ["282", { "weight": 0.5 }]] }'),
(49, 280, '281', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
(49, 280, '282', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Multiple final grade options
(50, null, '283', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test uploading failing grade and too large grade
(51, null, '284', 365, 2, 5, NOW(), NOW(), 'MANUAL', '{}'),
-- Test exporting only grades not already exported
(52, null, '285', 365, 0, 100, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [["286", { "weight": 0.25 }]] }'),
(52, 285, '286', 365, 0, 100, NOW(), NOW(), 'MANUAL', '{}'),
-- Test grade expiry
(53, null, '287', 365, 0, 5, NOW(), NOW(), 'WEIGHTED_AVERAGE', '{ "children": [] }'),
(53, 287, '288', 999, 0, 5, NOW(), NOW(), 'MANUAL', '{}'),
(53, 287, '289', 5, 0, 5, NOW(), NOW(), 'MANUAL', '{}');
