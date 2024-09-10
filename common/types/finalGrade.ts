// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema, IdSchema} from './general';
import {UserDataSchema} from './user';

export const FinalGradeDataSchema = z.strictObject({
  finalGradeId: IdSchema,
  user: UserDataSchema,
  courseId: IdSchema,
  gradingModelId: IdSchema.nullable(),
  grader: UserDataSchema,
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
  sisuExportDate: DateSchema.nullable(),
  comment: z.string().nullable(),
});
export const NewFinalGradeSchema = z.strictObject({
  userId: IdSchema,
  gradingModelId: IdSchema.nullable(),
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
