// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import {FinalGradeDataArraySchema} from './finalGrade';
import {DateSchema, LanguageSchema} from './general';
import {UserDataSchema} from './user';

export const GradeDataSchema = z.object({
  gradeId: z.number().int().optional(),
  grader: UserDataSchema,
  grade: z.number(),
  exportedToSisu: DateSchema.nullable(),
  date: DateSchema,
  expiryDate: DateSchema,
  comment: z.string().nullable(),
});
export const NewGradeSchema = z.object({
  studentNumber: z.string(),
  attainmentId: z.number().int(),
  grade: z.number(),
  date: DateSchema,
  expiryDate: DateSchema,
  comment: z.string(),
});
export const NewGradeArraySchema = z.array(NewGradeSchema);
export const AttainmentGradesDataSchema = z.object({
  attainmentId: z.number().int(),
  attainmentName: z.string(),
  grades: z.array(GradeDataSchema),
});
export const StudentRowSchema = z.object({
  user: UserDataSchema,
  finalGrades: FinalGradeDataArraySchema.optional(),
  attainments: z.array(AttainmentGradesDataSchema),
});
export const StudentRowArraySchema = z.array(StudentRowSchema);
export const EditGradeDataSchema = GradeDataSchema.omit({
  gradeId: true,
  grader: true,
}).partial();

export const SisuCsvUploadSchema = z.object({
  assessmentDate: DateSchema.optional(), // Assessment date override
  completionLanguage: LanguageSchema.optional(), // Defaults to course language TODO: confirm that the Language enum is valid for SISU
  studentNumbers: z.array(z.string()).nonempty(),
});

export type GradeData = z.infer<typeof GradeDataSchema>;
export type EditGradeData = z.infer<typeof EditGradeDataSchema>;
export type NewGrade = z.infer<typeof NewGradeSchema>;
export type AttainmentGradesData = z.infer<typeof AttainmentGradesDataSchema>;
export type StudentRow = z.infer<typeof StudentRowSchema>;

export type SisuCsvUpload = z.infer<typeof SisuCsvUploadSchema>;
