// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {FinalGradeDataArraySchema} from './finalGrade';
import {DateSchema, LanguageSchema} from './general';
import {UserDataSchema} from './user';

export const BaseGradeDataSchema = z.object({
  gradeId: z.number().int(),
  grader: UserDataSchema,
  aplusGradeSourceId: z.number().int().nullable(), // TODO: Should this be AplusGradeSourceData?
  grade: z.number(),
  exportedToSisu: DateSchema.nullable(),
  date: DateSchema,
  expiryDate: DateSchema,
  comment: z.string().nullable(),
});
export const GradeDataSchema = BaseGradeDataSchema.refine(
  val => val.expiryDate >= val.date,
  {path: ['date']}
);
export const NewGradeSchema = z
  .object({
    studentNumber: z.string(),
    coursePartId: z.number().int(),
    aplusGradeSourceId: z.number().int().optional(),
    grade: z.number(),
    date: DateSchema,
    expiryDate: DateSchema,
    comment: z.string().nullable(),
  })
  .refine(val => val.expiryDate >= val.date, {path: ['date']});
export const EditGradeDataSchema = BaseGradeDataSchema.omit({
  gradeId: true,
  grader: true,
})
  .partial()
  .refine(
    val =>
      val.date === undefined ||
      val.expiryDate === undefined ||
      val.expiryDate >= val.date,
    {path: ['date']}
  );

export const NewGradeArraySchema = z.array(NewGradeSchema);

export const CoursePartGradesDataSchema = z.object({
  coursePartId: z.number().int(),
  coursePartName: z.string(),
  grades: z.array(GradeDataSchema),
});
export const StudentRowSchema = z.object({
  user: UserDataSchema,
  courseParts: z.array(CoursePartGradesDataSchema),
  finalGrades: FinalGradeDataArraySchema.optional(),
});
export const StudentRowArraySchema = z.array(StudentRowSchema);
export const SisuCsvUploadSchema = z.object({
  assessmentDate: DateSchema.optional(), // Assessment date override
  completionLanguage: LanguageSchema.optional(), // Defaults to course language
  studentNumbers: z.array(z.string()).nonempty(),
});

export type GradeData = z.infer<typeof GradeDataSchema>;
export type EditGradeData = z.infer<typeof EditGradeDataSchema>;
export type NewGrade = z.infer<typeof NewGradeSchema>;
export type CoursePartGradesData = z.infer<typeof CoursePartGradesDataSchema>;
export type StudentRow = z.infer<typeof StudentRowSchema>;

export type SisuCsvUpload = z.infer<typeof SisuCsvUploadSchema>;
