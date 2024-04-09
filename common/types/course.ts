// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import {LanguageSchema, LocalizedStringSchema} from './general';
import {TeacherDataSchema} from './user';

export enum GradingScale {
  PassFail = 'PASS_FAIL',
  Numerical = 'NUMERICAL',
  SecondNationalLanguage = 'SECOND_NATIONAL_LANGUAGE',
}
export enum Period {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V',
}

export const GradingScaleSchema = z.nativeEnum(GradingScale);
export const PeriodSchema = z.nativeEnum(Period);

const BaseCourseDataSchema = z.object({
  // Course ID is either number type ID in the Aalto Grades database or
  // undefined when representing parsed Sisu data.
  id: z.number().int().optional(),
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
export const CourseDataArraySchema = z.array(CourseDataSchema);

export enum CourseRoleType {
  Teacher = 'TEACHER',
  Assistant = 'ASSISTANT',
  Student = 'STUDENT',
}
export const CreateCourseDataSchema = BaseCourseDataSchema.extend({
  teachersInCharge: z.array(z.string().email()),
  assistants: z.array(z.string().email()),
}).refine(val => val.maxCredits >= val.minCredits);

export const PartialCourseDataSchema = BaseCourseDataSchema.extend({
  teachersInCharge: z.array(z.string().email()),
  assistants: z.array(z.string().email()),
})
  .partial()
  .refine(
    val =>
      val.maxCredits !== undefined &&
      val.minCredits !== undefined &&
      val.maxCredits >= val.minCredits
  );

export type CourseData = z.infer<typeof CourseDataSchema>;
export type CreateCourseData = z.infer<typeof CreateCourseDataSchema>;
export type PartialCourseData = z.infer<typeof PartialCourseDataSchema>;
