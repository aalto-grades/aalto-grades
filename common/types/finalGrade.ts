// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const NewFinalGradeSchema = z.object({
  userId: z.number().int(),
  assessmentModelId: z.number().int(),
  grade: z.number().int().min(0).max(5),
  date: z.coerce.date().optional(), // Will accept null -> 1.1.1970
});
export const NewFinalGradeArraySchema = z.array(NewFinalGradeSchema);
export const FinalGradeDataSchema = z.object({
  userId: z.number().int(),
  courseId: z.number().int(),
  assessmentModelId: z.number().int(),
  graderId: z.number().int(),
  grade: z.number().int().min(0).max(5),
  date: z.coerce.date().optional(), // Will accept null -> 1.1.1970
  sisuExportDate: z.coerce.date().nullable(),
});
export const FinalGradeDataArraySchema = z.array(FinalGradeDataSchema);

export type NewFinalGrade = z.infer<typeof NewFinalGradeSchema>;
export type FinalGradeData = z.infer<typeof FinalGradeDataSchema>;
