// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {FinalGradeDataArraySchema} from './finalGrade';
import {LanguageSchema, LocalizedStringSchema} from './general';
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

export const GradingScaleSchema = z.nativeEnum(GradingScale);

export const BaseCourseDataSchema = z.strictObject({
  id: z.number().int(),
  courseCode: z.string(),
  minCredits: z.number().int().min(0),
  maxCredits: z.number().int(),
  department: LocalizedStringSchema,
  name: LocalizedStringSchema,
  gradingScale: GradingScaleSchema,
  languageOfInstruction: LanguageSchema,
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
