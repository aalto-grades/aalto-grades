// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {FinalGradeDataArraySchema} from './finalGrade';
import {IdSchema, LanguageSchema, LocalizedStringSchema} from './general';
import {TeacherDataSchema} from './user';

export enum GradingScale {
  PassFail = 'PASS_FAIL',
  Numerical = 'NUMERICAL',
  SecondNationalLanguage = 'SECOND_NATIONAL_LANGUAGE',
}

export enum CourseRoleType {
  Teacher = 'TEACHER',
  Assistant = 'ASSISTANT',
  Student = 'STUDENT',
}

export enum Department {
  // School of Arts, Design and Architecture
  Architecture = 'ARCHITECTURE',
  ArtAndMedia = 'ART_AND_MEDIA',
  Design = 'DESIGN',
  Film = 'FILM',

  // School of Business
  AccountingAndBusinessLaw = 'ACCOUNTING_AND_BUSINESS_LAW',
  Economics = 'ECONOMICS',
  Finance = 'FINANCE',
  ManagementStudies = 'MANAGEMENT_STUDIES',
  Marketing = 'MARKETING',
  InformationAndServiceManagement = 'INFORMATION_AND_SERVICE_MANAGEMENT',

  // School of Chemical Engineering
  BioproductsAndBiosystems = 'BIOPRODUCTS_AND_BIOSYSTEMS',
  ChemicalAndMetallurgicalEngineering = 'CHEMICAL_AND_METALLURGICAL_ENGINEERING',
  ChemistryAndMaterialsScience = 'CHEMISTRY_AND_MATERIALS_SCIENCE',

  // School of Electrical Engineering
  InformationAndCommunicationsEngineering = 'INFORMATION_AND_COMMUNICATIONS_ENGINEERING',
  ElectronicsAndNanoengineering = 'ELECTRONICS_AND_NANO_ENGINEERING',
  ElectricalEngineeringAndAutomation = 'ELECTRICAL_ENGINEERING_AND_AUTOMATION',

  // School of Engineering
  BuiltEnvironment = 'BUILT_ENVIRONMENT',
  CivilEngineering = 'CIVIL_ENGINEERING',
  MechanicalEngineering = 'MECHANICAL_ENGINEERING',

  // School of Science
  AppliedPhysics = 'APPLIED_PHYSICS',
  ComputerScience = 'COMPUTER_SCIENCE',
  IndustrialEngineeringAndManagement = 'INDUSTRIAL_ENGINEERING_AND_MANAGEMENT',
  MathematicsAndSystemsAnalysis = 'MATHEMATICS_AND_SYSTEMS_ANALYSIS',
  NeuroscienceAndBiomedicalEngineering = 'NEUROSCIENCE_AND_BIOMEDICAL_ENGINEERING',
}

export const GradingScaleSchema = z.nativeEnum(GradingScale);
export const DepartmentSchema = z.nativeEnum(Department);

export const BaseCourseDataSchema = z.strictObject({
  id: IdSchema,
  courseCode: z.string(),
  department: DepartmentSchema,
  minCredits: z.number().int().min(0),
  maxCredits: z.number().int(),
  gradingScale: GradingScaleSchema,
  languageOfInstruction: LanguageSchema,
  name: LocalizedStringSchema,
  teachersInCharge: z.array(TeacherDataSchema),
  assistants: z.array(TeacherDataSchema),
});

export const CourseDataSchema = BaseCourseDataSchema.refine(
  val => val.maxCredits >= val.minCredits
);
export const NewCourseDataSchema = BaseCourseDataSchema.omit({id: true})
  .extend({
    teachersInCharge: z.array(z.string().email()),
    assistants: z.array(z.string().email()),
  })
  .strict()
  .refine(val => val.maxCredits >= val.minCredits, {path: ['maxCredits']});
export const EditCourseDataSchema = BaseCourseDataSchema.omit({id: true})
  .extend({
    teachersInCharge: z.array(z.string().email()),
    assistants: z.array(z.string().email()),
  })
  .strict()
  .partial()
  .refine(
    val =>
      val.maxCredits === undefined ||
      val.minCredits === undefined ||
      val.maxCredits >= val.minCredits,
    {path: ['maxCredits']}
  );

export const CourseWithFinalGradesSchema = BaseCourseDataSchema.extend({
  finalGrades: FinalGradeDataArraySchema,
})
  .strict()
  .refine(val => val.maxCredits >= val.minCredits);

export const CourseDataArraySchema = z.array(CourseDataSchema);
export const CourseWithFinalGradesArraySchema = z.array(
  CourseWithFinalGradesSchema
);

export type CourseData = z.infer<typeof CourseDataSchema>;
export type NewCourseData = z.infer<typeof NewCourseDataSchema>;
export type EditCourseData = z.infer<typeof EditCourseDataSchema>;
export type CourseWithFinalGrades = z.infer<typeof CourseWithFinalGradesSchema>;
