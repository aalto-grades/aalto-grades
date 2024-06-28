// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema} from './general';
import {UserDataSchema} from './user';

export const FinalGradeDataSchema = z.strictObject({
  finalGradeId: z.number().int(),
  user: UserDataSchema,
  courseId: z.number().int(),
  gradingModelId: z.number().int().nullable(),
  grader: UserDataSchema,
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
  sisuExportDate: DateSchema.nullable(),
  comment: z.string().nullable(),
});
export const NewFinalGradeSchema = z.strictObject({
  userId: z.number().int(),
  gradingModelId: z.number().int().nullable(),
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
  comment: z.string().nullable(),
});
export const EditFinalGradeSchema = z
  .strictObject({
    grade: z.number().int().min(0).max(5),
    date: DateSchema,
    sisuExportDate: DateSchema.nullable(),
    comment: z.string().nullable(),
  })
  .partial();

export const NewFinalGradeArraySchema = z.array(NewFinalGradeSchema);
export const FinalGradeDataArraySchema = z.array(FinalGradeDataSchema);

export type FinalGradeData = z.infer<typeof FinalGradeDataSchema>;
export type NewFinalGrade = z.infer<typeof NewFinalGradeSchema>;
export type EditFinalGrade = z.infer<typeof EditFinalGradeSchema>;
