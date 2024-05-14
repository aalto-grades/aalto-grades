// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema} from './general';
import {UserDataSchema} from './user';

export const FinalGradeDataSchema = z.object({
  finalGradeId: z.number().int(),
  user: UserDataSchema,
  courseId: z.number().int(),
  assessmentModelId: z.number().int(),
  grader: UserDataSchema,
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
  sisuExportDate: DateSchema.nullable(),
});
export const NewFinalGradeSchema = z.object({
  userId: z.number().int(),
  assessmentModelId: z.number().int(),
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
});

export const NewFinalGradeArraySchema = z.array(NewFinalGradeSchema);
export const FinalGradeDataArraySchema = z.array(FinalGradeDataSchema);

export type NewFinalGrade = z.infer<typeof NewFinalGradeSchema>;
export type FinalGradeData = z.infer<typeof FinalGradeDataSchema>;
