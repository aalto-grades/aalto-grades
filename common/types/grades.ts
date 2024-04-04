// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import {FinalGradeDataArraySchema} from './finalGrade';
import {DateSchema, LanguageSchema} from './general';
import {UserDataSchema} from './user';

export const GradeOptionSchema = z.object({
  gradeId: z.number().int().optional(),
  grader: UserDataSchema,
  grade: z.number(), // z.int()?
  exportedToSisu: DateSchema.nullable(),
  date: DateSchema.optional(),
  expiryDate: DateSchema.optional(),
  comment: z.string().nullable(),
});
export const NewGradeSchema = z.object({
  studentNumber: z.string(),
  attainmentId: z.number().int(),
  grade: z.number(), // z.int()?
  date: DateSchema.optional(),
  expiryDate: DateSchema.optional(),
  comment: z.string(),
});
export const NewGradeArraySchema = z.array(NewGradeSchema);
export const AttainmentGradesDataSchema = z.object({
  attainmentId: z.number().int(),
  attainmentName: z.string().optional(),
  grades: z.array(GradeOptionSchema),
});
export const StudentRowSchema = z.object({
  user: UserDataSchema,
  finalGrades: FinalGradeDataArraySchema.optional(),
  attainments: z.array(AttainmentGradesDataSchema),
});
export const StudentRowArraySchema = z.array(StudentRowSchema);
export const PartialGradeOptionSchema = GradeOptionSchema.partial();

export const SisuCsvUploadSchema = z.object({
  assessmentDate: DateSchema.optional(), // Assessment date override
  completionLanguage: LanguageSchema.optional(), // Defaults to course language TODO: confirm that the Language enum is valid for SISU
  studentNumbers: z.array(z.string()).nonempty(),
});

export type GradeOption = z.infer<typeof GradeOptionSchema>;
export type PartialGradeOption = z.infer<typeof PartialGradeOptionSchema>;
export type NewGrade = z.infer<typeof NewGradeSchema>;
export type AttainmentGradesData = z.infer<typeof AttainmentGradesDataSchema>;
export type StudentRow = z.infer<typeof StudentRowSchema>;

export type SisuCsvUpload = z.infer<typeof SisuCsvUploadSchema>;
